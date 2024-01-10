const wsIP = `ws://209.134.45.110:8765`;
const socket = new WebSocket(wsIP);

let bgCycle = true;

let roomID = "";
let username = "";


function joinRoomGUI() {
  bgCycle = false;


  document.getElementById("chat").innerHTML = `
    <div class="card">
      <input placeholder="Room ID" id="ipInput">
      <div></div>
      <input placeholder="Username" id="username">
      <div></div>
      <button onclick="joinRoom()">Join</button>
    </div>
  `;
  document.body.style.backgroundColor = "rgb(125, 125, 125)";
  document.body.style.backgroundImage = "none";

}

function sendMessage() {
  msgInput = document.getElementById("input")
  socket.send(`MsgØ${username}: ${msgInput.value}Ø${roomID}`);
  msgInput.value = "";
}

function joinRoom() {
  const ipInput = document.getElementById("ipInput");
  const usernameInput = document.getElementById("username");
  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      const publicIP = data.ip;
      console.log(publicIP);

      roomID = ipInput.value;
      username = usernameInput.value;
      socket.send(`ConnectØ${ipInput.value}Ø${usernameInput.value}`);

      socket.onopen = () => {
        document.getElementById("chat").innerHTML += `<p>Connection Established</p>`;
      };

      socket.onmessage = (event) => {
        packet = event.data;
        console.log('Received packet:', packet);
        if (packet.startsWith("Joined ")){
          document.getElementById("chat").innerHTML = `
          <div class="chatbox" id="chatbox"></div>
          <input class="chatInput" id="input" placeholder="Message">
          <button class="sendButton" onclick="sendMessage()">Send</button>
          `
        }
        else {
          pak=packet.split(" ");
          for (let i = 0; i < pak.length; i++) {
            console.log(pak);
            if (pak[i].startsWith("https://")){
              packet=packet.replaceAll(pak[i], `<a href='javascript:window.open("${pak[i]}")'>${pak[i]}</a>`);
              if (pak[i].split("?")[0].endsWith(".jpg") || pak[i].split("?")[0].endsWith(".png")) {
                packet=packet.replaceAll(`<a href='javascript:window.open("${pak[i]}")'>${pak[i]}</a>`,`<img src="${pak[i]}" onclick="javascript:window.open('${pak[i]}')">`);
              }
              console.log(packet);
              
            }
            if (pak[i].startsWith("http://")){
              packet=packet.replaceAll(pak[i], `<a href='javascript:window.open("${pak[i]}")'>${pak[i]}</a>`);
              if (pak[i].split("?")[0].endsWith(".jpg") || pak[i].split("?")[0].endsWith(".png")) {
                packet=packet.replaceAll(`<a href='javascript:window.open("${pak[i]}")'>${pak[i]}</a>`,`<img src="${pak[i]}" onclick="javascript:window.open('${pak[i]}')">`);
              }
              console.log(packet);
              
            }
          }
          document.getElementById("chatbox").innerHTML += `
            <p class="userMsg">${packet.replace(username, "You")}<p>
            <div></div>
          `;
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    })
    .catch(error => {
      console.log(error);
    });
}

function createRoom() {
  document.getElementById("chat").style.textAlign = "left";
  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      const publicIP = data.ip;
      console.log(publicIP);

      document.getElementById("chat").innerHTML = `
      <div class='gradient' id='console'><div>
      `;

      socket.send(`NewSrv`);

    
      
      socket.addEventListener('open', (event) => {
        console.log('WebSocket connection opened', event);
        document.getElementById("console").innerHTML += "<p>Connected To Servers</p>";
        socket.send(`NewSrvØ${publicIP}`);
      });
    
      socket.addEventListener('message', (event) => {
        const message = event.data;
        console.log('Received message:', message);
        if (message.startsWith('ID')){
          parseData = message.split('Ø');
          document.getElementById("console").innerHTML += `<p>Room ID: ${parseData[1]}</p>`;
          document.getElementById("console").innerHTML += "<p>Connected To Servers</p>";
        }
        else {
          document.getElementById("console").innerHTML += `<p>${message}</p>`;
        }
      });
    
      socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed', event);
        document.getElementById("console").innerHTML += "<p>Server Stopped</p>";
      });
    
      socket.addEventListener('error', (event) => {
        console.error('WebSocket error', event);
      });
    })
    .catch(error => {
      console.log(error);
    });
}

function loadPublicRoomUI() {
  document.getElementById("chat").innerHTML = `
  <div class="card">
    <input placeholder="Custom Room ID" id="customIDInput">
    <div></div>
  <button onclick="createPublicRoom()">Start</button>
</div>
  `;
}

function createPublicRoom() {
  socket.send(`PubSrvØ${document.getElementById("customIDInput").value}`)

  socket.onmessage = (event) => {
    if (event.data == "SrvStrt")   {
      location.reload();
    }
  }
}


let menuExpanded = false;
function expandMenu() {
  menu = document.getElementById("submenu");
  menuBar = document.getElementById("menu");

  if (!menuExpanded) {
    menu.style = "height:100px; opacity: 100%;";
    menuBar.style = "border-bottom-right-radius: 0px; border-bottom-left-radius: 0px;"
    menuExpanded = true;
  } else {
    menu.style = "height:0px; opacity: 0%;";
    menuBar.style = "border-radius: 5px;"
    menuExpanded = false;
  }
}

const body = document.body;

document.addEventListener('mousemove', (event) => {
  const x = event.clientX;
  const y = event.clientY;

  calcX = (0 - (x / 10))
  calcY = (0 - (y / 3))

  body.animate({
    backgroundPosition : `${calcX}px ${calcY - 100}px`
  }, {duration: 10000});
});

let idx = 0;

function updateBackground() {
  if (bgCycle){
    idx++;
    if (idx > 3) {
      idx = 0;
    }
    body.style.backgroundImage = `url(backgrounds/${idx}.jpg)`;
  }
}

document.addEventListener('keydown', (event) => {
  const key = event.key;
  if (key == "Enter"){
    sendMessage()
  }
});

setInterval(updateBackground, 5000);