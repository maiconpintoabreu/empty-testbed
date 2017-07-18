events.push = function(e) {
  console.log("===> Building " + project.repo.cloneURL + " " + e.commit);

  var node = new Job("node-runner")
  node.image = "node:8"
  node.tasks = [
    "cd /src/hello",
    "npm install",
    "node index.js"
  ]
  node.env = {
    "unused": "myval",
    "unused2": project.secrets.dbPassword || "empty"
  }
  node.run()
}

events.imagePush = function(e) {
  console.log(JSON.stringify(e))
  var hook = e.payload
  console.log("===> Image push " + hook.repository.name + ":" + hook.push_data.tag)
}

events.after = function(e) {
  var c = e.payload.cause
  var m = "Hook " + c.type + " is in state " + e.payload.status +
    " for build " + e.commit + " of " + project.repo.name

  if (project.secrets.SLACK_WEBHOOK) {
    var slack = new Job("slack-notify")

    slack.image = "technosophos/slack-notify:latest"
    slack.env = {
      "SLACK_WEBHOOK": project.secrets.SLACK_WEBHOOK,
      "SLACK_USERNAME": "AcidBot",
      "SLACK_TITLE": "Build " + e.Type,
      "SLACK_MESSAGE": m + " <https://" + project.repo.name + ">"
    }

    slack.tasks = ["/slack-notify"]

    if (e.payload.status != "success") {
      slack.env.SLACK_COLOR = "#ff0000"
    }
    slack.run()
  } else {
    console.log(m)
  }
}

