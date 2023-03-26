const socket = io()
const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

socket.emit('joinRoom', {username, room})
// message from server
socket.on('message', (msg) => {
  outputMessage(msg)
  chatMessages.scrollTop = chatMessages.scrollHeight
})

socket.on('roomUsers', ({room, users}) => {
    ouputRoomName(room)
    outputUsers(users)
})


//message submit
chatForm.addEventListener('submit', e => {
     e.preventDefault()
     const msg = e.target.elements.msg.value

     //emitting chat message to server
     socket.emit('chatMessage', msg)

     //clear input field and focus
     e.target.elements.msg.value = ''
     e.target.elements.msg.focus()
})

function outputMessage(message){
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
       ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div)
}

function ouputRoomName(room){
   roomName.innerHTML = room
}

function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}