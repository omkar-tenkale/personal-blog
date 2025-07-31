(function() {
    
    let startTime = Date.now();
    let totalPausedTime = 0;
    let pauseStart = null;
    let logged = new Set();
    let isTracking = true;
    const thresholds = [10, 30, 60, 120, 300];
    
    function getTimeSpent() {
        let currentPausedTime = totalPausedTime;
        if (pauseStart) {
            currentPausedTime += Date.now() - pauseStart;
        }
        return Math.floor((Date.now() - startTime - currentPausedTime) / 1000);
    }
    
    function log(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        const time = m ? (s ? `${m}m ${s}s` : `${m}m`) : `${s}s`;
        
        if (seconds === 10) {
            track(`📊 ${time} on ${location.pathname} | ${navigator.userAgent}`);
        } else {
            track(`📊 ${time} on ${location.pathname}`);
        }
        logged.add(seconds);
    }

    function track(message) {
        // console.info(message);
        
        fetch('https://api.telegram.org/bot8476087872:AAHJkBqfu4r2gg-WPA_wz9dhGo0PN_UPR6o/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: 1160952918,
                text: message
            })
        }).catch(() => {});
    }
    
    function pause() {
        if (isTracking && !pauseStart) {
            pauseStart = Date.now();
            isTracking = false;
        }
    }
    
    function resume() {
        if (!isTracking && pauseStart) {
            const pauseDuration = Date.now() - pauseStart;
            totalPausedTime += pauseDuration;
            pauseStart = null;
            isTracking = true;
        }
    }
    
    function check() {
        if (!isTracking) {
            requestAnimationFrame(check);
            return;
        }
        
        const spent = getTimeSpent();
        
        for (const t of thresholds) {
            if (spent >= t && !logged.has(t)) log(t);
        }
        
        if (spent >= 300) {
            const fiveMinMark = Math.floor(spent / 300) * 300;
            if (fiveMinMark >= 300 && !logged.has(fiveMinMark)) log(fiveMinMark);
        }
        
        requestAnimationFrame(check);
    }
    
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            pause();
        } else {
            resume();
        }
    });
    
    window.addEventListener('focus', function() {
        resume();
    });
    
    window.addEventListener('blur', function() {
        pause();
    });
    
    document.readyState === 'loading' 
        ? document.addEventListener('DOMContentLoaded', () => {
            requestAnimationFrame(check);
        })
        : (() => {
            requestAnimationFrame(check);
        })();
        
})(); 