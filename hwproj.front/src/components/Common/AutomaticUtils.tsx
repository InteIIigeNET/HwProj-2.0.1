export default class AutomaticUtils {
    static getAutoSendSolutionScript = (taskId: number) => {
        return `
response=$(curl -o /dev/null -s -w "%{http_code}" -X POST \\
${window.location.origin}/api/automatic \\
-H 'Content-Type: application/json' \\
-H "Authorization: Bearer $TOKEN" \\
-d '{
    "GithubId": $GITHUB_LOGIN,
    "SolutionUrl": $SOLUTION_URL,
    "TaskId": ${taskId}
    }')
if [[ "$response" =~ ^2 ]]; then
    echo "Request successful"
else
    echo "Request failed with status $response"
    exit 1
fi`
    }
}
