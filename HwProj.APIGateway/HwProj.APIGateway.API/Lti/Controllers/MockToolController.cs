using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using System.Threading.Tasks;
using LtiAdvantage.AssignmentGradeServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

[Route("api/mocktool")]
[ApiController]
public class MockToolController : ControllerBase
{
    private static readonly RsaSecurityKey _signingKey;
    private static readonly string _keyId;
    private readonly IHttpClientFactory _httpClientFactory;

    // --- Имитация базы данных задач ---
    private record MockTask(string Id, string Title, string Description, int Score);
    private static readonly List<MockTask> _availableTasks = new()
    {
        new("1", "Интегралы (Mock)", "Вычислить определенный интеграл", 10),
        new("2", "Производные (Mock)", "Найти производную сложной функции", 5),
        new("3", "Пределы (Mock)", "Вычислить предел последовательности", 8),
        new("4", "Ряды (Mock)", "Исследовать ряд на сходимость", 12),
        new("5", "Диффуры (Mock)", "Решить линейное уравнение", 15)
    };

    public MockToolController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    static MockToolController()
    {
        var rsa = RSA.Create(2048);
        _keyId = Guid.NewGuid().ToString();
        _signingKey = new RsaSecurityKey(rsa) { KeyId = _keyId };
    }

    [HttpGet("jwks")]
    public IActionResult GetJwks()
    {
        var jwk = JsonWebKeyConverter.ConvertFromRSASecurityKey(_signingKey);
        return Ok(new { keys = new[] { jwk } });
    }

    [HttpPost("login")]
    public IActionResult Login([FromForm] string iss, [FromForm] string login_hint, [FromForm] string lti_message_hint)
    {
        var callbackUrl = $"{iss}/api/lti/authorize?" +
                          $"client_id=mock-tool-client-id&" +
                          $"response_type=id_token&" +
                          $"redirect_uri=http://localhost:5000/api/mocktool/callback&" +
                          $"login_hint={login_hint}&" +
                          $"lti_message_hint={lti_message_hint}&" +
                          $"scope=openid&state=xyz&nonce={Guid.NewGuid()}";

        return Redirect(callbackUrl);
    }

    [HttpPost("callback")]
    public async Task<IActionResult> Callback([FromForm] string id_token)
    {
        var handler = new JwtSecurityTokenHandler();
        if (!handler.CanReadToken(id_token)) return BadRequest("Invalid Token");
        var unverifiedToken = handler.ReadJwtToken(id_token);

        // --- ВАЛИДАЦИЯ (Без изменений) ---
        string issuer = unverifiedToken.Issuer;
        string platformJwksUrl = $"{issuer}/api/lti/jwks";

        var client = _httpClientFactory.CreateClient();
        string jwksJson;
        try
        {
            jwksJson = await client.GetStringAsync(platformJwksUrl);
        }
        catch
        {
            return BadRequest($"Не удалось скачать ключи HwProj по адресу {platformJwksUrl}");
        }

        var platformKeySet = new JsonWebKeySet(jwksJson);

        try
        {
            handler.ValidateToken(id_token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = "mock-tool-client-id",
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = platformKeySet.Keys
            }, out _);
        }
        catch (Exception ex)
        {
            return Unauthorized($"Ошибка проверки подписи HwProj: {ex.Message}");
        }

        var messageType = unverifiedToken.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti/claim/message_type")?.Value;

        if (messageType == "LtiDeepLinkingRequest")
        {
            // Здесь мы больше не отправляем ответ сразу, а рендерим UI
            return RenderDeepLinkingSelectionUI(unverifiedToken);
        }
        else if (messageType == "LtiResourceLinkRequest")
        {
            return HandleResourceLink(unverifiedToken);
        }
        else
        {
            return BadRequest($"Unknown message type: {messageType}");
        }
    }

    // --- ЭТАП 1: Отображение списка задач (HTML Form) ---
    private IActionResult RenderDeepLinkingSelectionUI(JwtSecurityToken token)
    {
        var settingsClaim = token.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings");
        if (settingsClaim == null) return BadRequest("No deep linking settings found");

        var settings = JsonDocument.Parse(settingsClaim.Value);
        var returnUrl = settings.RootElement.GetProperty("deep_link_return_url").GetString();
        
        // Нам нужно сохранить эти данные, чтобы использовать их на следующем шаге (в POST запросе)
        // В реальном приложении это кэшируется, но здесь передадим через скрытые поля формы
        var dataPayload = settings.RootElement.TryGetProperty("data", out var dataEl) ? dataEl.GetString() : "";

        // Генерируем HTML списка задач
        var tasksHtml = string.Join("", _availableTasks.Select(t => $@"
            <div class='task-item'>
                <label>
                    <input type='checkbox' name='selectedIds' value='{t.Id}' />
                    <span class='title'>{t.Title}</span>
                    <span class='score'>({t.Score} баллов)</span>
                    <p class='desc'>{t.Description}</p>
                </label>
            </div>"));

        var html = $@"
        <!DOCTYPE html>
        <html>
        <head>
            <title>Выбор задач (Mock Tool)</title>
            <style>
                body {{ font-family: 'Segoe UI', sans-serif; padding: 20px; background: #f9f9f9; }}
                .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
                h2 {{ color: #333; }}
                .task-item {{ border-bottom: 1px solid #eee; padding: 15px 0; }}
                .task-item:last-child {{ border-bottom: none; }}
                .title {{ font-weight: bold; font-size: 1.1em; margin-left: 10px; }}
                .score {{ color: #666; font-size: 0.9em; }}
                .desc {{ margin: 5px 0 0 28px; color: #555; }}
                .actions {{ margin-top: 20px; text-align: right; }}
                button {{ background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; }}
                button:hover {{ background: #0056b3; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>Библиотека задач (Mock Tool)</h2>
                <p>Выберите задачи, которые хотите добавить в курс HwProj:</p>
                
                <form action='/api/mocktool/submit-selection' method='POST'>
                    <!-- Скрытые поля для сохранения контекста возврата -->
                    <input type='hidden' name='returnUrl' value='{returnUrl}' />
                    <input type='hidden' name='data' value='{dataPayload}' />
                    <input type='hidden' name='iss' value='{token.Issuer}' />
                    <input type='hidden' name='aud' value='mock-tool-client-id' />

                    <div class='tasks-list'>
                        {tasksHtml}
                    </div>

                    <div class='actions'>
                        <button type='submit'>Импортировать выбранное</button>
                    </div>
                </form>
            </div>
        </body>
        </html>";

        return Content(html, "text/html");
    }

    // --- ЭТАП 2: Обработка выбора и отправка в HwProj ---
    [HttpPost("submit-selection")]
    public IActionResult SubmitDeepLinkingSelection(
        [FromForm] List<string> selectedIds, 
        [FromForm] string returnUrl,
        [FromForm] string? data,
        [FromForm] string iss,
        [FromForm] string aud)
    {
        // 1. Фильтруем задачи по выбору пользователя
        var selectedTasks = _availableTasks.Where(t => selectedIds.Contains(t.Id)).ToList();

        // 2. Формируем LTI Content Items
        var contentItems = selectedTasks.Select(t => new Dictionary<string, object>
        {
            ["type"] = "ltiResourceLink",
            ["title"] = t.Title,
            ["text"] = t.Description,
            // Ссылка запуска этой конкретной задачи
            ["url"] = $"http://localhost:5000/mock/task/{t.Id}", 
            ["scoreMaximum"] = t.Score,
            // Кастомные параметры, если нужны
            ["custom"] = new Dictionary<string, string> { ["internal_id"] = t.Id }
        }).ToList();

        // 3. Создаем JWT ответ (LtiDeepLinkingResponse)
        var payload = new JwtPayload
        {
            { "iss", iss }, // В LTI ответе issuer - это URL инструмента (но для подписи используем наши настройки)
            { "aud", aud }, 
            { "iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds() },
            { "exp", DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeSeconds() },
            { "nonce", "resp-nonce-" + Guid.NewGuid() },
            { "https://purl.imsglobal.org/spec/lti-dl/claim/message_type", "LtiDeepLinkingResponse" },
            { "https://purl.imsglobal.org/spec/lti-dl/claim/version", "1.3.0" },
            { "https://purl.imsglobal.org/spec/lti-dl/claim/content_items", contentItems }
        };

        // Если HwProj прислал параметр 'data', мы ОБЯЗАНЫ вернуть его обратно
        if (!string.IsNullOrEmpty(data))
        {
            payload.Add("https://purl.imsglobal.org/spec/lti-dl/claim/data", data);
        }

        // Подписываем токен НАШИМ ключом
        var credentials = new SigningCredentials(_signingKey, SecurityAlgorithms.RsaSha256);
        var header = new JwtHeader(credentials);
        
        // ВАЖНО: iss в токене должен совпадать с тем, что ожидает HwProj (обычно URL инструмента)
        // Для локального теста оставим http://localhost:5000
        payload["iss"] = "http://localhost:5000"; 
        
        var responseToken = new JwtSecurityToken(header, payload);
        var responseString = new JwtSecurityTokenHandler().WriteToken(responseToken);

        // 4. Возвращаем авто-сабмит форму, которая отправит токен в HwProj
        var html = $@"
        <html>
        <body onload='document.forms[0].submit()'>
            <div style='text-align:center; margin-top:50px; font-family:sans-serif;'>
                <h3>Возвращаемся в HwProj...</h3>
                <p>Передача {selectedTasks.Count} выбранных задач.</p>
            </div>
            <form method='POST' action='{returnUrl}'>
                <input type='hidden' name='JWT' value='{responseString}' />
            </form>
        </body>
        </html>";

        return Content(html, "text/html");
    }

    [HttpPost("send-score")]
    public async Task<IActionResult> SendScore(
        [FromForm] string lineItemUrl, 
        [FromForm] string userId, 
        [FromForm] string platformIss,
        [FromForm] string taskId,
        [FromForm] string returnUrl)
    {
        var client = _httpClientFactory.CreateClient();

        // --- ШАГ 1: Получаем Access Token от HwProj ---
        var clientAssertion = CreateClientAssertion(platformIss);
        
        var tokenRequest = new Dictionary<string, string>
        {
            ["grant_type"] = "client_credentials",
            ["client_assertion_type"] = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            ["client_assertion"] = clientAssertion,
            ["scope"] = "https://purl.imsglobal.org/spec/lti-ags/scope/score"
        };

        var tokenResponse = await client.PostAsync($"{platformIss}/api/lti/token", new FormUrlEncodedContent(tokenRequest));
        var tokenContent = await tokenResponse.Content.ReadAsStringAsync();
        
        if (!tokenResponse.IsSuccessStatusCode) 
            return BadRequest($"Ошибка получения токена HwProj: {tokenContent}");

        var accessToken = JsonDocument.Parse(tokenContent).RootElement.GetProperty("access_token").GetString();

        // --- ШАГ 2: Отправляем JSON с оценкой на ваш lineItemUrl ---
        var scoreObj = new Score
        {
            UserId = userId,
            ScoreGiven = 100.0,
            ScoreMaximum = 100.0,
            Comment = "Работа выполнена идеально (Отправлено из Mock Tool)",
            GradingProgress = GradingProgress.FullyGraded,
            TimeStamp = DateTime.UtcNow
        };

        var scoreRequest = new HttpRequestMessage(HttpMethod.Post, lineItemUrl)
        {
            Content = new StringContent(JsonSerializer.Serialize(scoreObj), System.Text.Encoding.UTF8, "application/vnd.ims.lti-ags.v1.score+json")
        };
        
        // Вставляем полученный токен в заголовок Authorization
        scoreRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var scoreResponse = await client.SendAsync(scoreRequest);
        var scoreResult = await scoreResponse.Content.ReadAsStringAsync();

        if (scoreResponse.IsSuccessStatusCode)
        {
            var html = $@"
            <div style='text-align:center; margin-top:50px; font-family:sans-serif;'>
                <h1 style='color:green;'>Успех!</h1>
                <p>Оценка 100 баллов успешно передана в HwProj (Задача: {taskId}).</p>
                <a href='{returnUrl}' style='padding:10px 20px; background:#007bff; color:white; text-decoration:none; border-radius:4px;'>Вернуться в курс</a>
            </div>";
            return Content(html, "text/html");
        }

        return BadRequest($"Ошибка при отправке оценки. Статус: {scoreResponse.StatusCode}. Детали: {scoreResult}");
    }

    private IActionResult HandleResourceLink(JwtSecurityToken token)
    {
        // Извлекаем URL возврата
        var presentationClaim = token.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti/claim/launch_presentation");
        var presentationJson = JsonDocument.Parse(presentationClaim?.Value ?? "{}");
        var returnUrl = presentationJson.RootElement.TryGetProperty("return_url", out var returnUrlProp) ? returnUrlProp.GetString() : "";

        // Извлекаем ID задачи
        var resourceLinkClaim = token.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti/claim/resource_link");
        var resourceLinkJson = JsonDocument.Parse(resourceLinkClaim?.Value ?? "{}");
        var taskId = resourceLinkJson.RootElement.TryGetProperty("id", out var idProp) ? idProp.GetString() : "";

        // НОВОЕ: Извлекаем AGS (ссылку для выставления оценок)
        var agsClaim = token.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint");
        var lineItemUrl = "";
        if (agsClaim != null)
        {
            var agsJson = JsonDocument.Parse(agsClaim.Value);
            if (agsJson.RootElement.TryGetProperty("lineitem", out var lineItemProp))
                lineItemUrl = lineItemProp.GetString();
        }

        var userId = token.Subject; // Идентификатор студента в HwProj
        var issuer = token.Issuer;  // URL HwProj

        var html = $@"
        <!DOCTYPE html>
        <html>
        <head>
            <style>body {{ font-family: sans-serif; text-align: center; padding: 50px; }} button {{ padding: 10px 20px; font-size: 16px; cursor: pointer; margin-top:10px; }}</style>
        </head>
        <body>
            <div style='border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto;'>
                <h1>Решение задачи (Mock Tool)</h1>
                <p>ID задачи: <b>{taskId}</b></p>
                <p>Студент: <b>{userId}</b></p>
                <hr/>
                
                <form action='/api/mocktool/send-score' method='POST'>
                    <input type='hidden' name='lineItemUrl' value='{lineItemUrl}' />
                    <input type='hidden' name='userId' value='{userId}' />
                    <input type='hidden' name='platformIss' value='{issuer}' />
                    <input type='hidden' name='taskId' value='{taskId}' />
                    <input type='hidden' name='returnUrl' value='{returnUrl}' />
                    
                    <button type='submit' style='background: #28a745; color: white; border: none; border-radius: 4px;'>
                        Завершить и отправить 100 баллов
                    </button>
                </form>

                <br/>
                <button onclick=""window.location.href='{returnUrl}'"">Вернуться без оценки</button>
            </div>
        </body>
        </html>";
        return Content(html, "text/html");
    }

    private string CreateClientAssertion(string platformIssuer)
    {
        var now = DateTime.UtcNow;
        // URL, куда инструмент пойдет за токеном (ваш LtiAccessTokenController)
        var tokenEndpoint = $"{platformIssuer}/api/lti/token"; 
    
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Iss, "http://localhost:5000"), // ClientId нашего инструмента
            new(JwtRegisteredClaimNames.Sub, "mock-tool-client-id"),
            new(JwtRegisteredClaimNames.Aud, tokenEndpoint),         // Audience = URL вашего эндпоинта
            new(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new(JwtRegisteredClaimNames.Exp, new DateTimeOffset(now.AddMinutes(5)).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var jwt = new JwtSecurityToken(
            header: new JwtHeader(new SigningCredentials(_signingKey, SecurityAlgorithms.RsaSha256)),
            payload: new JwtPayload(claims)
        );

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}