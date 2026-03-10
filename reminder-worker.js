{\rtf1\ansi\ansicpg1252\cocoartf2761
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\froman\fcharset0 Times-Roman;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs24 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 // reminder-worker.js\
// Runs a lightweight clock tick in a Web Worker.\
// Note: iOS may still suspend workers when the PWA is fully backgrounded for long periods.\
\
let intervalMs = 60000; // default 1 minute\
let timer = null;\
\
function start() \{\
\'a0 stop();\
\'a0 timer = setInterval(() => \{\
\'a0\'a0\'a0 postMessage(\{ type: 'tick', now: Date.now() \});\
\'a0 \}, intervalMs);\
\}\
\
function stop() \{\
\'a0 if (timer) clearInterval(timer);\
\'a0 timer = null;\
\}\
\
onmessage = (e) => \{\
\'a0 const msg = e.data || \{\};\
\'a0 if (msg.type === 'start') \{\
\'a0\'a0\'a0 if (typeof msg.intervalMs === 'number' && msg.intervalMs >= 1000) \{\
\'a0\'a0\'a0\'a0\'a0 intervalMs = msg.intervalMs;\
\'a0\'a0\'a0 \}\
\'a0\'a0\'a0 start();\
\'a0 \} else if (msg.type === 'stop') \{\
\'a0\'a0\'a0 stop();\
\'a0 \} else if (msg.type === 'setInterval') \{\
\'a0\'a0\'a0 if (typeof msg.intervalMs === 'number' && msg.intervalMs >= 1000) \{\
\'a0\'a0\'a0\'a0\'a0 intervalMs = msg.intervalMs;\
\'a0\'a0\'a0\'a0\'a0 start();\
\'a0\'a0\'a0 \}\
\'a0 \}\
\};\
}