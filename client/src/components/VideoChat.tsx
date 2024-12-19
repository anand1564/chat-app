import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:3000");

const VideoChat = () => {
  const [myId, setMyId] = useState("");
  const [peerId, setPeerId] = useState("");
  const myVideo = useRef();
  const peerVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    socket.on("connect", () => setMyId(socket.id || ""));
    socket.on("signal", ({ signal, from }) => {
      const peer = new Peer({ initiator: false, trickle: false });
      peer.signal(signal);

      peer.on("signal", (signal) => {
        socket.emit("signal", { signal, target: from });
      });

      peer.on("stream", (stream) => {
        if (peerVideo.current) peerVideo.current.srcObject = stream;
      });

      connectionRef.current = peer;
    });

    socket.on("user-joined", (userId) => setPeerId(userId));
  }, []);

  const startCall = () => {
    const peer = new Peer({ initiator: true, trickle: false });

    peer.on("signal", (signal) => {
      socket.emit("signal", { signal, target: peerId });
    });

    peer.on("stream", (stream) => {
      if (peerVideo.current) peerVideo.current.srcObject = stream;
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (myVideo.current) myVideo.current.srcObject = stream;
      peer.addStream(stream);
    });

    connectionRef.current = peer;
  };

  return (
    <div>
      <div>
        <video ref={myVideo} autoPlay muted />
        <video ref={peerVideo} autoPlay />
      </div>
      <button onClick={startCall}>Start Call</button>
    </div>
  );
};

export default VideoChat;
