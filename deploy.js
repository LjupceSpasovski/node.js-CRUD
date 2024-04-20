const { exec } = require('child_process');

function deployToEC2() {
  exec(`ssh -i node-app.pem ubuntu@ec2-3-94-106-181.compute-1.amazonaws.com "cd node.js-CRUD && git pull origin main && npm install && pm2 restart app"`, (err, stdout, stderr) => {
    if (err) {
      console.error("Error deploying to EC2 instance", err);
      return;
    }
    console.log("Deployment successful:", stdout);
  });
}

deployToEC2();