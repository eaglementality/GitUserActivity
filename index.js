const readline = require("readline");

const interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function formatEvent(event) {
  const repo = event.repo.name;

  switch (event.type) {
    case "PushEvent":
      const commitCount = event.payload.commits?.length||0;
      return `- Pushed ${commitCount} commit${commitCount > 1 ? "s" : ""} to ${repo}`;

    case "IssuesEvent":
      if (event.payload.action === "opened") {
        return `- Opened a new issue in ${repo}`;
      }
      return null;

    case "PullRequestEvent":
      if (event.payload.action === "opened") {
        return `- Opened a pull request in ${repo}`;
      }
      return null;

    case "WatchEvent":
      return `- Starred ${repo}`;

    case "ForkEvent":
      return `- Forked ${repo}`;

    default:
      return null;
  }
}

 async function FetchUserActivities(username) {
    try {
      const res = await fetch(`https://api.github.com/users/${username}/events`, {
        method: "GET",
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "github-user-activity",
        },
      });
      if (!res.ok) {
        console.log("Error: Unable to fetch data. Please check the username and try again.");
        return;
      }
      const data = await res.json();
        if (data.length === 0) {
            console.log("No recent activity found for this user.");
            return;
        }else {
            const output = data.map(formatEvent).filter(Boolean);
            console.log(output.join("\n"));
        }
    } catch (error) {
        console.log("An error occurred while fetching data:", error);
    }
  }

interface.question("github-activity:", (answer) => {
  const hasSpace = /\s/.test(answer);
  const hasUppercase = /[A-Z]/.test(answer);
  if (hasSpace || hasUppercase) {
    console.log(
      "Invalid username. Please ensure there are no spaces or uppercase letters."
    );
    return;
  }
    FetchUserActivities(answer);
  interface.close();
});
