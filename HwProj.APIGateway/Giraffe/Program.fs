module Giraffe.App

open System
open System.IO
open System.Net.Http
open Giraffe.TaskBuilder
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Cors.Infrastructure
open Microsoft.AspNetCore.Hosting
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.Logging
open Microsoft.Extensions.DependencyInjection
open Giraffe

open SwaggerProvider

let httpClient = new HttpClient()
httpClient.BaseAddress <- Uri("http://localhost:5001")

type AuthService = OpenApiClientProvider<"http://localhost:5001/swagger/v1/swagger.json">
type RegisterViewModel = AuthService.RegisterViewModel
let authServiceClient = AuthService.Client(httpClient)

let register: HttpHandler =
    fun _ (ctx: HttpContext) ->
        task {
            let! model = ctx.BindModelAsync<RegisterViewModel>()
            do! authServiceClient.ApiAccountRegisterPost(model)
            return Some ctx
        }

let login =
    fun f (ctx: HttpContext) ->
        task {
            let! model = ctx.BindModelAsync<AuthService.LoginViewModel>()
            let! token = authServiceClient.ApiAccountLoginPost(model)
            return! json token f ctx
        }

let webApp =
    choose [
        POST >=>
            choose [
                route "/api/account/register" >=> register
                route "/api/account/login" >=> login
            ]
        setStatusCode 404 >=> text "Not Found" ]

// ---------------------------------
// Error handler
// ---------------------------------

let errorHandler (ex : Exception) (logger : ILogger) =
    logger.LogError(ex, "An unhandled exception has occurred while executing the request.")
    clearResponse >=> setStatusCode 500 >=> text ex.Message

// ---------------------------------
// Config and Main
// ---------------------------------

let configureCors (builder : CorsPolicyBuilder) =
    builder
        .WithOrigins(
            "http://localhost:5000")
       .AllowAnyMethod()
       .AllowAnyHeader()
       |> ignore

let configureApp (app : IApplicationBuilder) =
    let env = app.ApplicationServices.GetService<IWebHostEnvironment>()
    (match env.IsDevelopment() with
    | true  ->
        app.UseDeveloperExceptionPage()
    | false ->
        app .UseGiraffeErrorHandler(errorHandler)
            .UseHttpsRedirection())
        .UseCors(configureCors)
        .UseStaticFiles()
        .UseGiraffe(webApp)

let configureServices (services : IServiceCollection) =
    services.AddCors()    |> ignore
    services.AddGiraffe() |> ignore

let configureLogging (builder : ILoggingBuilder) =
    builder.AddConsole()
           .AddDebug() |> ignore

[<EntryPoint>]
let main args =
    let contentRoot = Directory.GetCurrentDirectory()
    let webRoot     = Path.Combine(contentRoot, "WebRoot")
    Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(
            fun webHostBuilder ->
                webHostBuilder
                    .UseUrls("http://localhost:5000/")
                    .UseContentRoot(contentRoot)
                    .UseWebRoot(webRoot)
                    .Configure(Action<IApplicationBuilder> configureApp)
                    .ConfigureServices(configureServices)
                    .ConfigureLogging(configureLogging)
                    |> ignore)
        .Build()
        .Run()
    0
