
const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

var peer = new Peer(undefined,{
    path:'/peerjs',
    host:'/',
    port:3030
});

let myVideoStream
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
}).then(stream => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        peer.on('call', call => {
            call.answer(stream)
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                
                addVideoStream(video, userVideoStream)
            })
        })

        socket.on('user-connected', (userId) => {
            setTimeout(() => {
                connectToNewUser(userId, stream);
            },1000)
            
        })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

const connectToNewUser = (userId, stream) => {
    console.log('new user-connected');
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

let text = $('input');

$('html').keydown( (e) =>{
    if(e.which == 13 && text.val().length != 0){
        socket.emit('message', text.val());
        text.val('');
    }
})

socket.on('createMessage', message =>{
    $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`);
    scrollToBottom()
})

const scrollToBottom = () => {
    let d = $('main__chat__window');
    d.scrollTop(d.prop('scrollHeight'));
}

//mute our Audio
const muteUnmute = () => {

    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else{
        myVideoStream.getAudioTracks()[0].enabled =true;
        setMuteButton();
    }
}

const setMuteButton = () =>{
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>`

    document.querySelector('.main__mute__button').innerHTML = html;
}

const setUnmuteButton = () =>{
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>`

    document.querySelector('.main__mute__button').innerHTML = html; 
}

//hide our Video
const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayButton();
    }
    else{
        myVideoStream.getVideoTracks()[0].enabled = true;
        setStopButton();
    }
}

const setStopButton = () =>{
    const html = `
        
        <i class="fas fa-video"></i>
        <span>Stop Video</span>`

    document.querySelector('.main__video__button').innerHTML = html;
}

const setPlayButton = () =>{
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span>Play</span>`

    document.querySelector('.main__video__button').innerHTML = html;
}