export default class AutomaticUtils {
    static getAutoSendSolutionScript = (taskId: number) => {
        return (
`response=$(curl --location -i -s -o /dev/null -w "%{http_code}" '${window.location.origin}/api/Solutions/automatic' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $Token' \
--data-raw '{
    "GithubId": $GITHUB_LOGIN,
    "SolutionUrl": $SOLUTION_URL,
    "TaskId": ${taskId}
}')
if [[ \${response:0:1} != "2" ]]; then
    echo "Failed"
    exit 1
else
    echo "Success"
fi`)}
}
