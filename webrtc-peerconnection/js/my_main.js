'use strict';

var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var hangupButton = document.getElementById('hangupButton');
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;


var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');

var pc1, pc2, localStream, offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}

function start() {
	navigator.mediaDevices.getUserMedia({
		video: true,
		audio: true
	}).then((stream) => {
		localVideo.srcObject = stream
		localStream = stream
		callButton.disabled = false
	})
}

function onSetSessionDescriptionError(e){
	console.log('这里报错', e)
}

function call() {
	const server = null;
	pc1 = new RTCPeerConnection(server);
	pc2 = new RTCPeerConnection(server);
	const audioTracks = localStream.getAudioTracks();
	const videoTracks = localStream.getVideoTracks();
	if(audioTracks.length > 0){
		audioTracks.forEach(item => {
			pc1.addTrack(item, localStream);
		});
	}
	if(videoTracks.length > 0){
		videoTracks.forEach(item => {
			pc1.addTrack(item, localStream);
		});
	}
	pc2.onaddstream = function(e){
		remoteVideo.srcObject = e.stream;
		console.log('这里收到流啦感谢', e);
	};



	pc1.createOffer(offerOptions).then((desc) => {
		pc1.setLocalDescription(desc).then(() => {
			console.log('设置offer本地描述成功');
		});
		pc2.setRemoteDescription(desc).then(() => {
			console.log('设置offer远程描述成功');
		})

		pc2.createAnswer().then((descrip) => {
			pc2.setLocalDescription(descrip).then(() => {
				console.log('设置answer本地描述成功')
			});
			 pc1.setRemoteDescription(descrip).then(function(e) {
			 	console.log('设置远程pc1描述成功')
    		},onSetSessionDescriptionError);
		}).catch(e => {
			console.log('在创建pc2answer时候有问题', e)
		});

	})

	pc1.onicecandidate = function(e) {
	 	onIceCandidate(pc1, e);
	};
	pc2 = new RTCPeerConnection(servers);
  	trace('Created remote peer connection object pc2');
  	pc2.onicecandidate = function(e) {
  		onIceCandidate(pc2, e);
  	};

}

function onIceCandidate(pc, event) {
  getOtherPc(pc).addIceCandidate(event.candidate)
    .then(
      function() {
        console.log('onIceCandidate加成功了', event)
      }
    );
}