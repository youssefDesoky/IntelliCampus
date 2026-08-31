// import React, { useState, useEffect, useRef } from 'react';
// import MeetingButton from '../ui/Button';

// export default function DailyManager({ onAttendanceUpdate }) {
//     const [roomName, setRoomName] = useState('');
//     const [meetingStarted, setMeetingStarted] = useState(false);
//     const [participants, setParticipants] = useState([]);
//     const [userName, setUserName] = useState('');
//     const [isAudioMuted, setIsAudioMuted] = useState(true);
//     const [isVideoMuted, setIsVideoMuted] = useState(true);
//     const [activeView, setActiveView] = useState('create'); // 'create' or 'join'
//     const containerRef = useRef(null);
//     const apiRef = useRef(null);

//     const initializeMeeting = () => {
//         if (!meetingStarted || !roomName) return;

//         if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
//             alert('Your browser does not support media devices. Please update your browser or use a different one.');
//             setMeetingStarted(false);
//             return;
//         }

//         apiRef.current = new window.JitsiMeetExternalAPI("8x8.vc", {
//             roomName: `vpaas-magic-cookie-10bb8c4440ce4318b582e5730279c2b6/${roomName}`,
//             parentNode: containerRef.current,
//             configOverwrite: {
//                 startWithAudioMuted: true,  // Start with audio muted
//                 startWithVideoMuted: true,  // Start with video muted
//                 prejoinPageEnabled: false
//             },
//             interfaceConfigOverwrite: {
//                 TOOLBAR_BUTTONS: [] // Hide all default toolbar buttons
//             },
//             userInfo: {
//                 displayName: userName || 'User'
//             }
//         });

//         // Event listeners
//         apiRef.current.addEventListener('participantJoined', (event) => {
//             const name = userName || event.displayName || `User-${event.id.substring(0, 6)}`;
//             setParticipants(prev => [...prev, { id: event.id, name }]);
//         });

//         apiRef.current.addEventListener('participantLeft', (event) => {
//             setParticipants(prev => prev.filter(p => p.id !== event.id));
//         });

//         apiRef.current.addEventListener('audioMuteStatusChanged', (event) => {
//             setIsAudioMuted(event.muted);
//         });

//         apiRef.current.addEventListener('videoMuteStatusChanged', (event) => {
//             setIsVideoMuted(event.muted);
//         });

//         apiRef.current.addEventListener('readyToClose', () => {
//             setMeetingStarted(false);
//             if (onAttendanceUpdate) onAttendanceUpdate(participants);
//         });
//     };

//     useEffect(() => {
//         if (!window.JitsiMeetExternalAPI) {
//             const script = document.createElement('script');
//             script.src = 'https://8x8.vc/vpaas-magic-cookie-10bb8c4440ce4318b582e5730279c2b6/external_api.js';
//             script.async = true;
//             document.head.appendChild(script);
//             script.onload = () => initializeMeeting();
//         } else {
//             initializeMeeting();
//         }

//         return () => {
//             if (apiRef.current) {
//                 apiRef.current.dispose();
//             }
//         };
//     }, [meetingStarted]);

//     const startMeeting = () => {
//         if (!userName) {
//             alert('Please enter your name');
//             return;
//         }
//         const randomName = 'Meeting-' + Math.random().toString(36).substr(2, 9);
//         setRoomName(randomName);
//         setMeetingStarted(true);
//     };

//     const joinMeeting = () => {
//         if (!roomName) {
//             alert('Please enter a room name');
//             return;
//         }
//         if (!userName) {
//             alert('Please enter your name');
//             return;
//         }
//         setMeetingStarted(true);
//     };

//     const generateRoomName = () => {
//         const randomName = 'Meeting-' + Math.random().toString(36).substr(2, 9);
//         setRoomName(randomName);
//     };

//     const handleMute = () => apiRef.current?.executeCommand('toggleAudio');
//     const handleVideo = () => apiRef.current?.executeCommand('toggleVideo');
//     const handleScreenShare = () => apiRef.current?.executeCommand('toggleShareScreen');
//     const handleEnd = () => {
//         if (apiRef.current) {
//             apiRef.current.executeCommand('hangup');
//         }
//         setMeetingStarted(false);
//     };

//     if (meetingStarted) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
//                 <div className="flex-1 flex flex-col p-4 md:p-8">
//                     <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl">
//                         <div className="flex justify-between items-center mb-6">
//                             <div className="text-white">
//                                 <h3 className="text-xl md:text-2xl font-bold mb-2">{roomName}</h3>
//                                 <span className="text-sm text-gray-300">Host: {userName || 'You'}</span>
//                                 <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm mt-2">
//                                     <i className="fas fa-crown"></i>
//                                     Host
//                                 </div>
//                             </div>
//                             <MeetingButton 
//                               role="host" 
//                               onClick={handleEnd} 
//                               onIcon="fas fa-phone-slash" 
//                               styles="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
//                             >
//                                 Leave Meeting
//                             </MeetingButton>
//                         </div>
//                         <div className="flex-1 relative bg-black rounded-2xl overflow-hidden">
//                             <div ref={containerRef} className="w-full h-full"></div>
                            
//                             {/* Custom Controls */}
//                             <div className="absolute bottom-4 start-1/2 transform -translate-x-1/2 z-20 flex gap-2 md:gap-4 bg-gray-800/90 backdrop-blur-md border border-gray-600 rounded-2xl p-2 md:p-4 shadow-2xl overflow-x-auto max-w-full">
//                                 <MeetingButton 
//                                   role="host" 
//                                   isOn={!isAudioMuted} 
//                                   onIcon="fas fa-microphone" 
//                                   offIcon="fas fa-microphone-slash" 
//                                   onClick={handleMute}
//                                   styles={`px-3 md:px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${isAudioMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
//                                 >
//                                     {isAudioMuted ? 'Unmute' : 'Mute'}
//                                 </MeetingButton>

//                                 <MeetingButton 
//                                   role="host" 
//                                   isOn={!isVideoMuted} 
//                                   onIcon="fas fa-video" 
//                                   offIcon="fas fa-video-slash" 
//                                   onClick={handleVideo}
//                                   styles={`px-3 md:px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${isVideoMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
//                                 >
//                                     {isVideoMuted ? 'Start Video' : 'Stop Video'}
//                                 </MeetingButton>

//                                 <MeetingButton 
//                                   role="host" 
//                                   onIcon="fas fa-desktop" 
//                                   onClick={handleScreenShare}
//                                   styles="bg-gray-700 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
//                                 >
//                                     Share Screen
//                                 </MeetingButton>

//                                 <MeetingButton 
//                                   role="host" 
//                                   onIcon="fas fa-comments" 
//                                   onClick={() => apiRef.current?.executeCommand('toggleChat')}
//                                   styles="bg-gray-700 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
//                                 >
//                                     Chat
//                                 </MeetingButton>
//                                 <MeetingButton 
//                                   role="host" 
//                                   onIcon="fas fa-hand-paper" 
//                                   onClick={() => apiRef.current?.executeCommand('toggleRaiseHand')}
//                                   styles="bg-gray-700 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
//                                 >
//                                     Raise Hand
//                                 </MeetingButton>

//                                 <MeetingButton 
//                                   role="host" 
//                                   onIcon="fas fa-phone-slash" 
//                                   onClick={handleEnd}
//                                   styles="bg-red-500 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
//                                 >
//                                     End Call
//                                 </MeetingButton>
//                             </div>
                            
//                             <div className="absolute top-4 end-4 z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl max-w-xs">
//                                 <h4 className="font-bold mb-3 text-white">Attendance ({participants.length})</h4>
//                                 <ul className="list-none space-y-2">
//                                     {participants.map(p => (
//                                         <li key={p.id} className="flex items-center gap-2 text-gray-300">
//                                             <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                                             {p.name}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
//             <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl">
//                 <div className="text-center mb-8">
//                     <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Attendance Meeting</h2>
//                     <p className="text-gray-300">Start or join a video meeting with real-time attendance tracking</p>
//                 </div>

//                 {/* Tabs */}
//                 <div className="flex mb-6 bg-white/10 rounded-xl p-1">
//                     <button 
//                         onClick={() => setActiveView('create')}
//                         className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${activeView === 'create' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'}`}
//                     >
//                         <i className="fas fa-plus me-2"></i>
//                         Create Meeting
//                     </button>
//                     <button 
//                         onClick={() => setActiveView('join')}
//                         className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${activeView === 'join' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'}`}
//                     >
//                         <i className="fas fa-sign-in-alt me-2"></i>
//                         Join Meeting
//                     </button>
//                 </div>

//                 {activeView === 'create' && (
//                     <div className="space-y-6">
//                         <div className="flex flex-col gap-2">
//                             <label htmlFor="userName" className="text-white font-medium flex items-center gap-2">
//                                 <i className="fas fa-user"></i>
//                                 Your Name:
//                             </label>
//                             <input
//                                 id="userName"
//                                 type="text"
//                                 value={userName}
//                                 onChange={(e) => setUserName(e.target.value)}
//                                 className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter your display name"
//                             />
//                         </div>

//                         <MeetingButton 
//                           onClick={startMeeting} 
//                           onIcon="fas fa-rocket"
//                           role="host"
//                           styles="w-full bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
//                         >
//                           Create & Start Meeting
//                         </MeetingButton>

//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                             <div className="bg-white/10 rounded-xl p-4 text-center">
//                                 <i className="fas fa-users text-2xl text-blue-400 mb-2"></i>
//                                 <span className="text-white font-medium">Real-time Attendance</span>
//                             </div>
//                             <div className="bg-white/10 rounded-xl p-4 text-center">
//                                 <i className="fas fa-video text-2xl text-green-400 mb-2"></i>
//                                 <span className="text-white font-medium">HD Video</span>
//                             </div>
//                             <div className="bg-white/10 rounded-xl p-4 text-center">
//                                 <i className="fas fa-shield-alt text-2xl text-yellow-400 mb-2"></i>
//                                 <span className="text-white font-medium">Secure</span>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {activeView === 'join' && (
//                     <div className="space-y-6">
//                         <div className="flex flex-col gap-2">
//                             <label htmlFor="userNameJoin" className="text-white font-medium flex items-center gap-2">
//                                 <i className="fas fa-user"></i>
//                                 Your Name:
//                             </label>
//                             <input
//                                 id="userNameJoin"
//                                 type="text"
//                                 value={userName}
//                                 onChange={(e) => setUserName(e.target.value)}
//                                 className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter your display name"
//                             />
//                         </div>

//                         <div className="flex flex-col gap-2">
//                             <label className="text-white font-medium flex items-center gap-2">
//                                 <i className="fas fa-video"></i>
//                                 Meeting Room
//                             </label>
//                             <input
//                                 type="text"
//                                 value={roomName}
//                                 onChange={(e) => setRoomName(e.target.value)}
//                                 className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter meeting room name"
//                             />
//                         </div>

//                         <MeetingButton 
//                           role="host"
//                           onClick={joinMeeting} 
//                           styles="w-full bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-2"
//                           onIcon="fas fa-sign-in-alt"
//                         >
//                             Join Meeting
//                         </MeetingButton>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }