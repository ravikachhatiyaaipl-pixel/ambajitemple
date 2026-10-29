

// src/pages/utils/ai-knowledge.js
// ============================================
// 0️⃣ LANGUAGE CONFIGURATION
// ============================================

const SUPPORTED_LANGUAGES = [
   { code: 'en', label: 'English', nativeLabel: 'English', speechLang: 'en-IN', flag: '🇬🇧' },
   { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', speechLang: 'gu-IN', flag: '🇮🇳' },
];

let _currentLangCode = (() => {
   try { return localStorage.getItem('chatbot_language') || 'en'; } catch (_) { return 'en'; }
})();

const getLanguage = () =>
   SUPPORTED_LANGUAGES.find(l => l.code == _currentLangCode) || SUPPORTED_LANGUAGES[0];

const setLanguage = (code) => {
   const lang = SUPPORTED_LANGUAGES.find(l => l.code == code);
   if (!lang) return;
   _currentLangCode = code;
   try { localStorage.setItem('chatbot_language', code); } catch (_) { }
   // Update live speech recognition language if voice assistant is running
   if (voiceAssistantInstance) {
      const rec = voiceAssistantInstance.recognizer?.recognition;
      if (rec) rec.lang = lang.speechLang;
   }
};

const getSupportedLanguages = () => SUPPORTED_LANGUAGES;

// Returns a Gemini prompt instruction to reply in the selected language
const getLanguageInstruction = () => {
   const lang = getLanguage();
   if (lang.code == 'en') return '';
   return `IMPORTANT: Respond entirely in ${lang.label} (${lang.nativeLabel}). Do not use English.`;
};

// ============================================
// 1️⃣ VOICE CONFIGURATION
// ============================================
const voiceConfig = {
   recognition: {
      language: 'en-US',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
   },
   speech: {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      language: 'en-US',
   },

   commands: {
      'print cheque': 'How to print a cheque?',
      'cheque sample': 'Show me a cheque sample',
      'cheque format': 'Which banks are supported for cheque printing?',
      'call expert': 'call expert',
      'talk to expert': 'call expert',
      'help me': 'call expert',
      'emergency': 'emergency call',
      'urgent': 'emergency call',
      'critical': 'emergency call',
      'help': 'help',
      'stop': 'STOP',
      'clear': 'CLEAR',
      'reset': 'RESET',
      'create bill': 'How to create a bill?',
      'trial balance': 'How to generate trial balance?',
      'profile': 'How to edit my profile?',
      'leave': 'How to apply for leave?',
      'hall': 'How to book a hall?',
      'reports': 'What reports are available?',
      'shop': 'How to book a shop?',
      'employees': 'How to manage employees?',
      // ✅ ADD THESE 4 NEW COMMANDS
      'end call': 'end call',
      'hang up': 'end call',
      'call status': 'call status',
      'is call active': 'call status',
   },
   commandResponses: {
      'STOP': '🛑 Stopped listening',
      'CLEAR': '🗑️ Chat cleared',
      'RESET': '🔄 Chat reset',
      // ✅ ADD THESE 2 NEW RESPONSES
      'end call': '⏹️ Ending call...',
      'call status': '📊 Checking call status...',
   },

   // ✅ EXPERT CALL CONFIGURATION (Already there)
   expertCall: {
      phoneNumber: '+919876543210',
      emergencyNumber: '+919XXXXXXXXX',
      enabled: true,
      useDailyCo: true,
   },

   // ✅ DAILY.CO CONFIGURATION (Already there)
   dailyCo: {
      enabled: true,
      domain: 'your-domain.daily.co',
      apiKey: process.env.REACT_APP_DAILY_API_KEY || '',
      autoJoin: true,
   },
};


// ============================================
// 2️⃣ SPEECH RECOGNITION ENGINE
// ============================================

class SpeechRecognizer {
   constructor() {
      this.recognition = null;
      this.isListening = false;
      this.onResult = null;
      this.onError = null;
      this.onEnd = null;
      this._finalSent = false; // prevent duplicate final results
      this.initRecognition();
   }

   initRecognition() {
      const SpeechRecognition =
         window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
         console.warn('Speech recognition not supported in this browser');
         return;
      }

      this.recognition = new SpeechRecognition();

      // ✅ en-IN gives much better accuracy for Indian-accented English
      this.recognition.lang = 'en-IN';

      // ✅ continuous: true — keeps listening across natural pauses,
      //    so the user doesn't have to press the button for every sentence
      this.recognition.continuous = true;

      // ✅ interimResults: true — shows live text while speaking
      this.recognition.interimResults = true;

      // ✅ maxAlternatives: 3 — pick the best of 3 guesses
      this.recognition.maxAlternatives = 3;

      this.recognition.onresult = (event) => {
         let interimText = '';
         let finalText = '';

         for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            // Pick the highest-confidence alternative
            let best = result[0];
            for (let j = 1; j < result.length; j++) {
               if (result[j].confidence > best.confidence) best = result[j];
            }
            if (result.isFinal) {
               finalText += best.transcript;
            } else {
               interimText += best.transcript;
            }
         }

         if (interimText && this.onResult) {
            this.onResult(interimText.trim(), false);
         }

         if (finalText.trim() && this.onResult) {
            this.onResult(finalText.trim(), true);
         }
      };

      this.recognition.onerror = (event) => {
         if (event.error != 'no-speech' && event.error != 'aborted') {
            console.warn('Speech recognition error:', event.error);
         }
         this.isListening = false;
         if (this.onError) this.onError(event.error);
      };

      this.recognition.onend = () => {
         this.isListening = false;
         if (this.onEnd) this.onEnd();
      };
   }

   start() {
      if (this.isListening || !this.recognition) return false;
      try {
         this.recognition.start();
         this.isListening = true;
         return true;
      } catch (e) {
         console.warn('SpeechRecognizer.start error:', e.message);
         this.isListening = false;
         return false;
      }
   }

   stop() {
      if (!this.recognition || !this.isListening) return false;
      try {
         this.recognition.stop();
         this.isListening = false;
         return true;
      } catch (e) {
         this.isListening = false;
         return false;
      }
   }

   abort() {
      try { this.recognition && this.recognition.abort(); } catch (_) { }
      this.isListening = false;
   }

   isSupported() {
      return !!this.recognition;
   }
}

// ============================================
// 3️⃣ TEXT-TO-SPEECH ENGINE
// ============================================
class TextToSpeech {
   constructor() {
      this.synth = window.speechSynthesis;
      this.isSpeaking = false;
      this.currentUtterance = null;
      this._voicesReady = false;

      // Pre-load voices
      if (this.synth) {
         if (this.synth.getVoices().length > 0) {
            this._voicesReady = true;
         } else {
            this.synth.addEventListener('voiceschanged', () => {
               this._voicesReady = true;
            });
         }
      }
   }

   speak(text, options = {}) {
      if (!this.isSupported() || !text) return false;

      // Cancel any current speech first
      this.cancel();

      const doSpeak = () => {
         try {
            const clean = text
               .replace(/\*\*(.+?)\*\*/g, '$1')
               .replace(/[*_`#|→\[\]]/g, '')
               .replace(/https?:\/\/\S+/g, '')
               .replace(/\s+/g, ' ')
               .trim()
               .substring(0, 500);

            if (!clean) return false;

            const utterance = new SpeechSynthesisUtterance(clean);
            utterance.rate = options.rate || voiceConfig.speech.rate;
            utterance.pitch = options.pitch || voiceConfig.speech.pitch;
            utterance.volume = options.volume || voiceConfig.speech.volume;
            utterance.lang = voiceConfig.speech.language;

            const voices = this.synth.getVoices();
            const preferred = voices.find(
               v => v.lang == 'en-US' && !v.name.includes('Google') // local voices are more reliable
            ) || voices.find(v => v.lang.startsWith('en-US'))
               || voices.find(v => v.lang.startsWith('en'));
            if (preferred) utterance.voice = preferred;

            utterance.onstart = () => { this.isSpeaking = true; };
            utterance.onend = () => { this.isSpeaking = false; this.currentUtterance = null; };
            utterance.onerror = (e) => {
               if (e.error != 'interrupted') console.warn('TTS error:', e.error);
               this.isSpeaking = false;
               this.currentUtterance = null;
            };

            this.currentUtterance = utterance;
            this.synth.speak(utterance);
            // Mark speaking immediately (onstart can be delayed)
            this.isSpeaking = true;
            return true;
         } catch (e) {
            console.warn('TTS speak failed:', e);
            return false;
         }
      };

      if (!this._voicesReady) {
         // Voices not loaded yet — wait then speak
         const onReady = () => {
            this._voicesReady = true;
            this.synth.removeEventListener('voiceschanged', onReady);
            doSpeak();
         };
         this.synth.addEventListener('voiceschanged', onReady);
         return false;
      }

      return doSpeak();
   }

   cancel() {
      try { this.synth && this.synth.cancel(); } catch (_) { }
      this.isSpeaking = false;
      this.currentUtterance = null;
   }

   isSupported() { return !!window.speechSynthesis; }
   isSpeakingNow() { return this.isSpeaking || (this.synth && this.synth.speaking); }
   getVoices() { return this.synth ? this.synth.getVoices() : []; }
}

// ============================================
// 4️⃣ VOICE ASSISTANT
// ============================================

class VoiceAssistant {
   constructor() {
      this.recognizer = new SpeechRecognizer();
      this.speaker = new TextToSpeech();
      this.isActive = false;
      this.shouldAutoRestart = false;

      // External callbacks — set these from outside before calling start()
      this.onCommand = null;        // (command: string, data: any) => void
      this.onInterimResult = null;  // (transcript: string) => void
      this.onFinalResult = null;    // (transcript: string) => void
      this.onStateChange = null;    // (isActive: boolean) => void

      this._setupListeners();
   }

   _setupListeners() {
      this.recognizer.onResult = (transcript, isFinal) => {
         if (isFinal) {
            console.log('🎤 Final transcript:', transcript);
            this._handleTranscript(transcript);
         } else {
            if (this.onInterimResult) this.onInterimResult(transcript);
         }
      };

      this.recognizer.onError = (error) => {
         if (error == 'not-allowed' || error == 'permission-denied') {
            console.error('❌ Microphone permission denied');
            this.shouldAutoRestart = false;
            this._setActive(false);
            return;
         }
         // no-speech is normal in continuous mode — just keep going
         if (this.shouldAutoRestart) {
            this._scheduleRestart();
         }
      };

      this.recognizer.onEnd = () => {
         // In continuous mode onEnd fires when browser forcibly ends the session
         // (e.g. after ~60s of silence, or tab loses focus).
         // Restart automatically so user doesn't have to press the button again.
         if (this.shouldAutoRestart) {
            this._scheduleRestart();
         } else {
            this._setActive(false);
         }
      };
   }

   _setActive(val) {
      this.isActive = val;
      if (this.onStateChange) this.onStateChange(val);
   }

   _handleTranscript(transcript) {
      const lower = transcript.toLowerCase().trim();

      // Ignore anything picked up while the bot is speaking
      // (mic hears its own TTS output in continuous mode)
      if (this.speaker.isSpeakingNow()) {
         console.log('🔇 Ignoring transcript during TTS:', transcript);
         return;
      }

      // Notify UI of the final transcript
      if (this.onFinalResult) this.onFinalResult(transcript);

      // ── Built-in commands (handled here, no AI lookup needed) ──

      if (lower == 'stop' || lower == 'cancel' || lower == 'stop listening') {
         this.stop();
         this.speak('Stopped');
         return;
      }

      if (lower.includes('clear') && lower.length < 15) {
         if (this.onCommand) this.onCommand('CLEAR', null);
         this.speak('Chat cleared');
         return;
      }

      if (lower.includes('reset') && lower.length < 15) {
         if (this.onCommand) this.onCommand('RESET', null);
         this.speak('Chat reset');
         return;
      }

      if (lower.includes('end call') || lower.includes('hang up')) {
         if (this.onCommand) this.onCommand('end_call', null);
         this.speak('Ending call');
         return;
      }

      if (lower.includes('call status') || lower.includes('is call active')) {
         if (this.onCommand) this.onCommand('call_status', null);
         return;
      }

      if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('critical')) {
         if (this.onCommand) this.onCommand('emergency', null);
         this.speak('Connecting to emergency support');
         return;
      }

      if (
         lower.includes('call expert') ||
         lower.includes('talk to expert') ||
         lower.includes('need help') ||
         lower.includes('connect to expert')
      ) {
         if (this.onCommand) this.onCommand('call_expert', null);
         this.speak('Connecting you to an expert');
         return;
      }

      // ── All other speech → route as a query to the dashboard handler ──
      // The dashboard handler does the knowledge lookup + Gemini fallback + TTS
      if (this.onCommand) {
         this.onCommand('query', transcript);
      }
   }

   _scheduleRestart() {
      // With continuous mode, we pause mic while TTS is playing
      // so the bot doesn't hear its own voice as a new command.
      const tryRestart = () => {
         if (this.speaker.isSpeakingNow()) {
            setTimeout(tryRestart, 200);
            return;
         }
         if (this.shouldAutoRestart && !this.recognizer.isListening) {
            // Small gap after TTS finishes so mic doesn't catch the last syllable
            setTimeout(() => {
               if (this.shouldAutoRestart) this._startRecognizer();
            }, 300);
         }
      };
      tryRestart();
   }

   _startRecognizer() {
      if (this.recognizer.isListening) {
         this.recognizer.abort();
      }
      const ok = this.recognizer.start();
      if (ok) {
         this._setActive(true);
      } else {
         // Retry once after a short delay (handles "already started" race)
         setTimeout(() => {
            if (this.shouldAutoRestart && !this.recognizer.isListening) {
               this.recognizer.start();
               this._setActive(true);
            }
         }, 500);
      }
   }

   // In VoiceAssistant class - replace the start() method

   start() {
      if (this.isActive) return;
      this.shouldAutoRestart = true;

      const doStart = () => {
         // Check if microphone is available before starting
         if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.warn('⚠️ enumerateDevices not supported');
            this._startRecognizer();
            this.speak('Listening');
            return;
         }

         // Check for microphone devices
         navigator.mediaDevices.enumerateDevices()
            .then(devices => {
               const audioInputs = devices.filter(device => device.kind == 'audioinput');
               if (audioInputs.length == 0) {
                  console.warn('⚠️ No microphone found');
                  if (this.onError) this.onError('No microphone detected');
                  // Still try to start - browser might find one later
                  this._startRecognizer();
                  this.speak('No microphone detected. Please connect a microphone.');
                  return;
               }
               // Microphone found, start recognition
               this._startRecognizer();
               this.speak('Listening');
            })
            .catch(err => {
               console.warn('⚠️ enumerateDevices error:', err);
               // Fallback: try to start anyway
               this._startRecognizer();
               this.speak('Listening');
            });
      };

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
         navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
               // Release the stream immediately — recognition API manages the mic
               stream.getTracks().forEach(t => t.stop());
               doStart();
            })
            .catch(err => {
               console.error('🔴 Mic permission denied:', err.name, err.message);
               this.shouldAutoRestart = false;
               this._setActive(false);
               // Show user-friendly message
               if (this.onError) {
                  const msg = err.name == 'NotFoundError'
                     ? 'No microphone found. Please connect a microphone and try again.'
                     : err.name == 'NotAllowedError'
                        ? 'Microphone access denied. Please allow microphone access in your browser settings.'
                        : 'Unable to access microphone. Please check your audio settings.';
                  this.onError(msg);
               }
               // Speak error message
               this.speak(err.name == 'NotFoundError'
                  ? 'No microphone detected. Please connect a microphone.'
                  : 'Unable to access microphone. Please check your settings.');
            });
      } else {
         doStart();
      }
   }
   stop() {
      this.shouldAutoRestart = false;
      this.recognizer.stop();
      this._setActive(false);
   }

   speak(text) {
      return this.speaker.speak(text);
   }

   isListening() {
      return this.isActive;
   }

   isVoiceSupported() {
      return this.recognizer.isSupported() && this.speaker.isSupported();
   }
}

// ============================================
// 5️⃣ VOICE HELPER FUNCTIONS (UPDATED)
// ============================================

let voiceAssistantInstance = null;

const getVoiceAssistant = () => {
   if (!voiceAssistantInstance) {
      voiceAssistantInstance = new VoiceAssistant();
   }
   return voiceAssistantInstance;
};

const isVoiceSupported = () => {
   return !!(
      (window.SpeechRecognition || window.webkitSpeechRecognition) &&
      window.speechSynthesis
   );
};

const getVoiceCommands = () => {
   return Object.keys(voiceConfig.commands);
};

const speakResponse = (text) => {
   const assistant = getVoiceAssistant();
   if (assistant && assistant.isVoiceSupported()) {
      assistant.speak(text);
      return true;
   }
   return false;
};

const getVoiceCommandHelp = () => {
   return `🎤 **Voice Commands Available:**

| Say This | Action |
|----------|--------|
| "print cheque" | Shows cheque printing guide |
| "cheque sample" | Shows sample cheque |
| "cheque format" | Shows bank layouts |
| "call expert" | 📞 Connects to expert via Daily.co |
| "talk to expert" | 📞 Connects to expert via Daily.co |
| "help me" | 📞 Connects to expert via Daily.co |
| "emergency" | 🚨 Emergency support via Daily.co |
| "urgent" | 🚨 Emergency support via Daily.co |
| "help" | Shows help menu |
| "stop" | Stops voice recognition |
| "clear" | Clears chat |
| "reset" | Resets chat |
| "create bill" | Opens bill creation |
| "trial balance" | Shows trial balance |
| "profile" | Opens profile settings |
| "leave" | Opens leave application |
| "hall" | Opens hall booking |
| "reports" | Shows reports |
| "shop" | Opens shop booking |
| "employees" | Opens employee management |

🎤 Just say these commands anytime while voice is active!`;
};

// ============================================
// ✅ DAILY.CO HELPER FUNCTIONS (NEW)
// ============================================

/**
 * Check if Daily.co is configured
 */
const isDailyCoEnabled = () => {
   return voiceConfig.dailyCo?.enabled == true;
};

/**
 * Get Daily.co configuration
 */
const getDailyCoConfig = () => {
   return voiceConfig.dailyCo || {};
};

/**
 * Get Daily.co domain
 */
const getDailyCoDomain = () => {
   return voiceConfig.dailyCo?.domain || 'your-domain.daily.co';
};

/**
 * Get Daily.co room URL (frontend only)
 */
const getDailyCoRoomUrl = (roomName) => {
   const domain = getDailyCoDomain();
   return `https://${domain}/${roomName || 'voice-support-room'}`;
};

/**
 * Get Daily.co voice command help
 */
const getDailyCoVoiceHelp = () => {
   return `🎤 **Voice Commands for Daily.co Calls:**

| Say This | Action |
|----------|--------|
| "call expert" | 📞 Start a voice call with an expert |
| "talk to expert" | 📞 Connect to an expert |
| "help me" | 📞 Get help from an expert |
| "emergency" | 🚨 Start an emergency call |
| "urgent" | 🚨 Emergency support |
| "stop" | ⏹️ Stop voice recognition |
| "help" | 📖 Show this help menu |

🎤 Just say these commands anytime!`;
};

/**
 * Create Daily.co room via backend (optional)
 */
const createDailyCoRoom = async (roomName, isPrivate = true) => {
   try {
      const response = await fetch('http://localhost:5000/api/daily/rooms', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            roomName: roomName || `voice-room-${Date.now()}`,
            isPrivate: isPrivate,
            properties: {
               enable_chat: false,
               enable_screenshare: false,
               start_audio_off: false,
               start_video_off: true,
            },
         }),
      });

      const data = await response.json();
      return data;
   } catch (error) {
      console.error('❌ Failed to create Daily.co room:', error);
      return { success: false, error: error.message };
   }
};

/**
 * Check Daily.co server health
 */
const checkDailyCoHealth = async () => {
   try {
      const response = await fetch('http://localhost:5000/api/daily/health');
      const data = await response.json();
      return data.status == 'healthy';
   } catch (error) {
      console.error('❌ Daily.co health check failed:', error);
      return false;
   }
};

// ============================================
// 6️⃣ KNOWLEDGE BASE (UPDATED with Daily.co)
// ============================================

const knowledgeBase = {
   Zone: {
      keywords: [
         'zone',
         'manage-zone',
         'create zone',
         'update zone',
         'delete zone',
         'zone master',
         'zone management',
      ],
      response: `📄 How to Create a zone:
  
  1. Go to master menu
  2. click on organization and select zone master
  3. Click on Add New Zone
  4. Fill in zone details:
     - Zone Name
     - Zone Code
     - Status (Active/Inactive)
  5. Click create zone
  6. The new zone will appear in the list
  7. Click Confirm to finalize

View Zone:

8. Find the zone in the list
9. Click the View button or click on the zone name
10. View zone details:
   - Zone Name - Display name
   - Zone Code - Unique code
   - Status - Active/Inactive badge
   - Statistics - Wards, CCC, Active Users

Edit Zone:

11. Find the zone in the list
12. Click the Edit button
13. Update the required fields:
    - Zone Name
    - Zone Code
    - Status (Active/Inactive)
14. Click Update Zone
15. Click Confirm to save changes

Delete Zone:

16. Find the zone in the list
17. Click the Delete button 
18. Confirmation dialog appears:
    - Delete Zone? title
    - Shows zone name being deleted
    - Are you sure you want to delete Zone Name? This action cannot be undone.
19. Click Yes, delete! to confirm
20. Click Cancel to abort deletion

🔗 **Click here to go:** [Go to Zone Master →](/masters/organization-management/zone-master)

  💡 **Pro Tip:** You can also create zones from the Quick Actions section on your dashboard!

  Would you like me to guide you through any specific step?`,
   },

   ward: {
      keywords: [
         'ward',
         'manage-ward',
         'create ward',
         'update ward',
         'delete ward',
         ' how to create ward master',
         'ward management',
      ],
      response: `📄 **How to Create a ward:**
  
  1. Go to master menu
  2. click on organization and select ward master
  3. Click on Add New Ward
  4. Fill in ward details:
     - Ward Name
     - Ward Code
     - Status (Active/Inactive)
  5. Click create ward
  6. The new ward will appear in the list
  7. Click Confirm to finalize

View Ward:

8. Find the ward in the list
9. Click the View button or click on the ward name
10. View ward details:
   - Ward Name - Display name
   - Ward Code - Unique code (with copy button)
   - Status - Active/Inactive badge
   - Zone Information - Parent zone details
   - CCC Count - Number of CCCs in the ward

Edit Ward:

11. Find the ward in the list
12. Click the Edit button 
13. Update the required fields:
    - Ward Name
    - Ward Code
    - Zone (Parent zone selection)
    - Status (Active/Inactive)
13. Click Update Ward
14. Click Confirm to save changes

Delete Ward:

15. Find the ward in the list
16. Click the Delete button 
17. Confirmation dialog appears:
    - Delete Ward? title
    - Shows ward name being deleted
    - Are you sure you want to delete "Ward Name"? This action cannot be undone.
18. Click Yes, delete! to confirm
19. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Ward Master →](/masters/organization-management/ward-master)'

💡 **Pro Tip:** You can also create wards from the Quick Actions section on your dashboard!

  Would you like me to guide you through any specific step?`,
   },

   area: {
      keywords: [
         'area',
         'manage-area',
         'create area',
         'update area',
         'delete area',
         ' how to create area master',
         'area management',
      ],
      response: `📄 **How to Create an area:**
  
  1. Go to master menu
  2. click on organization and select area master
  3. Click on Add New Area
  4. Fill in area details:
     - Area Name
     - Area Code
     - Ward Code
     - Status (Active/Inactive)
  5. Click create area
  6. The new area will appear in the list
  7. Click Confirm to finalize

View Area:

7. Find the area in the list
8. Click the View button  or click on the area name
9. View area details:
   - Area Name - Display name
   - Area Code - Unique code (with copy button)
   - Status - Active/Inactive badge
   - Ward Information - Parent ward details
   - Zone Information - Parent zone details

Edit Area:

10. Find the area in the list
11. Click the Edit button 
     - Area Name
    - Area Code
    - Ward (Parent ward selection)
    - Status (Active/Inactive)
13. Click Update Area
14. Click Confirm to save changes

Delete Area:

15. Find the area in the list
16. Click the Delete button 
17. Confirmation dialog appears:
    - "Delete Area?" title
    - Shows area name being deleted
    - "Are you sure you want to delete "Area Name"? This action cannot be undone."
18. Click Yes, delete! to confirm
19. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Area Master →](/masters/organization-management/area-master)'

  💡 **Pro Tip:** You can also create areas from the Quick Actions section on your dashboard!

  Would you like me to guide you through any specific step?`,
   },

   City_civic_center: {
      keywords: [
         'city civic center',
         'civic center',
         'add city civic center',
         'update city civic center',
         'delete city civic center',
         'city civic center master',
         'city civic center management',
      ],
      response: `📄 **How to Create a city civic center:**
  
  1. Go to master menu
  2. click on organization and select city civic center master
  3. Click on Add New City Civic Center
  4. Fill in city civic center details:
     - City Civic Center Name
     - City Civic Center Code
     - Status (Active/Inactive)
  5. Click create city civic center
  6. The new city civic center will appear in the list
  7. Click Confirm to finalize

View CCC:

7. Find the CCC in the list
8. Click the View button or click on the CCC name
9. View CCC details:
   - CCC Name - Display name
   - CCC Code - Unique code (with copy button)
   - Status - Active/Inactive badge
   - Ward Information - Parent ward details
   - Location Hierarchy - Full organizational hierarchy

Edit CCC:

10. Find the CCC in the list
11. Click the Edit button 
12. Update the required fields:
    - CCC Name
    - CCC Code
    - Area/Ward (Parent selection)
    - Status (Active/Inactive)

13. Click Update CCC
14. Click Confirm to save changes

Delete CCC:

20. Find the CCC in the list
21. Click the Delete button
22. Confirmation dialog appears:
    - "Delete CCC?" title
    - Shows CCC name being deleted
    - "Are you sure you want to delete "CCC Name"? This action cannot be undone."
23. Click Yes, delete! to confirm
24. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to City Civic Center Master →](/masters/organization-management/city-civic-centers-master)

💡 **Pro Tip:** You can also create city civic centers from the Quick Actions section on your dashboard!
Would you like me to guide you through any specific step?`,
   },

   Department: {
      keywords: [
         'department',
         'branch',
         'manage department',
         'create department',
         'update department',
         'delete department',
         'department master',
         'branch management',
         'add department',
      ],
      response: `📄 **How to Manage Departments/Branches:**

1. Go to Master menu
2. Click on Organization and select Department/Branch Master
3. The page shows:
   - Total Department count
   - Level 1-4 department counts
   - Visible/Hidden department status
4. To Add a New Department:
   - Click on Add First Department or + button
   - Fill in department details:
     - Department Name (English)
     - Group Codes
     - Status (Active/Inactive)
     - Visibility (Visible/Hidden)
   - Click Save to create
5. To Edit a department:
   - Click on the Edit icon in Actions column
6. To Delete department:
   - Click on the Delete icon in Actions column

Edit Department:

7. Find the department in the list
8. Click the Edit button 
9. Update the required fields:
    - Description - Update department description
    - Department Name(English - Update English name
    - Visibility - Toggle Visible/Hidden

10. Click Save Changes
11. Click Confirm to save changes

Delete Department:

12. Find the department in the list
13. Click the Delete button
14. Confirmation dialog appears:
    - "Delete Department?" title
    - Shows department name being deleted
    - "Are you sure you want to delete "Department Name"? This action cannot be undone."
15. Click OK to confirm
16. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Department Master →](/masters/organization-management/department-master)'

💡 **Pro Tip:** 
- Departments can have multiple levels (Level 1-4) for hierarchical organization
- Use **Group Codes** to categorize similar departments
- Set Visibility to **Hidden** to temporarily disable a department without deleting it
- Click on **Department Details** to view complete information of any department`,
   },

   //masters/grant-management/grant-type-master

   grant_type: {
      keywords: [
         'grant',
         'grant type',
         'grant master',
         'create grant',
         'add grant',
         'new grant type',
         'update category',
         'delete grant',
         'edit grant',
      ],
      response: `📄 **How to Create a New Grant Type:**

1. Go to Masters menu
2. Click on Grant Type Master
3. Select Add New Grant Type
4. Enter the Grant Name
   - Example: Capital Grant, Revenue Grant
5. Enter Grant Code
6. Select Grant Category
   - Choose the appropriate category from the dropdown
7. Select Grant Nature
   - Example: Revenue or Capital
8. Select Grant Condition
   - Example: Yes or No
9. Specify the Utilization Period
   - Utilization From Date
   - Utilization To Date
10. Select Accounting Mode
11. Select Grant Fund Source
12. Set the Status
    - Active
    - Inactive
13. Review all entered details
14. Click Create Grant Type to save the record
15. Click Cancel if you do not want to save the changes

Edit Grant Type:

16. Find the grant type in the list
17. Click the Edit button 
18. Update the required fields:
    - Grant Name
    - Grant Code
    - Grant Category
    - Grant Nature
    - Grant Fund Source
    - Accounting Mode
    - Grant Condition
    - Utilization dates
    - Status (Active/Inactive)
19. Click Update Grant Type
20. Click Confirm to save changes

Delete Grant Type:

21. Find the grant type in the list
22. Click the Delete button
23. Confirmation dialog appears:
    - "Delete Grant Type?" title
    - Shows grant name being deleted
    - "Are you sure you want to delete "Grant Name"? This action cannot be undone."
24. Click Yes, delete! to confirm
25. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Grant Type Master →](/masters/grant-management/grant-type-master)'

💡 **Pro Tips:**
- Grant Name is mandatory.
- Grant Code should be unique if provided.
- Utilization dates are optional and can be specified when applicable.
- Inactive grant types will not be available for selection in transactions.
- Verify all information before creating the grant type.`,
   },

   grant_category: {
      keywords: [
         'grant category',
         'category',
         'create category master',
         'update category',
         'delete category',
         'new grant category',
         'manage category',
         'view grant category',
      ],
      response: `📄 **How to Create a New Grant Category:**

1. Go to Masters menu
2. Click on Grant Management
3. Select Grant Category Master
4. Click on Add New Grant Category
5. Enter the Category Name
   - Example:
     - Infrastructure Grant
     - Research Grant
     - Revenue Grant
   - Maximum length: 100 characters
6. Enter the Category Code
7. Set the Category Status
   - Active – Category will be available for grant assignment
   - Inactive – Category will not be available for grant assignment
8. Review all entered details
9. Click Create Grant Category to save the record
10. Click Cancel to discard the changes and return to the previous page

View Grant Category:

11. Find the grant category in the list
12. Click the View button or click on the category name
13. View grant category details:
    - Category Name - Display name (with copy button)
    - Category Code - Unique code (with copy button)
    - Status - Active/Inactive/Deleted badge
    - Created Date - When category was created
    - Last Updated - When category was last modified
    - Deleted Date - If category was deleted (if applicable)
    - Audit Information - Creation and update timestamps

Edit Grant Category:

14. Find the grant category in the list
15. Click the Edit button
16. Update the required fields:
    - Category Name (Mandatory)
    - Category Code (Read-only after creation)
    - Status (Active/Inactive)
17. Click Update Grant Category
18. Click Confirm to save changes

Delete Grant Category:

16. Find the grant category in the list
17. Click the Delete button
18. Confirmation dialog appears:
    - "Delete Grant Category?" title
    - Shows category name being deleted
    - "Are you sure you want to delete "Category Name"? This action cannot be undone."
19. Click Yes, delete! to confirm
20. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Grant Category Master →](/masters/grant-management/grant-category-master)'

💡 **Pro Tips:**
- Category Name is mandatory and cannot be left blank.
- Category Code should be unique across all grant categories.
- Inactive categories will not appear while assigning grants.
- Verify all information before creating the category.
- Use meaningful category names to easily identify different types of grants.`,
   },

   grant_fund_source: {
      keywords: [
         'grant fund source',
         'fund source',
         'update grant fund source',
         'delete grant fund source',
         'create grant fund source',
         'view grant fund source',
         'edit grant authority',
      ],
      response: `📄 **How to Create a New Grant Fund Source:**
  
1. Go to Masters menu
2. Click on Grant Management
3. Enter Authority Name
4. Enter Authority Code
5. Select Status Code
6. Click on Create Grant Authority

View Grant Authority:

7. Find the grant authority in the list
8. Click the View button or click on the authority name
9. View grant authority details:
    - Authority Name - Display name (with copy button)
    - Authority Code - Unique code (with copy button)
    - Status - Active/Inactive badge
    - Created Date - When authority was created
    - Last Updated - When authority was last modified
    - Audit Information - Creation and update timestamps

Edit Grant Authority:

10. Find the grant authority in the list
11. Click the Edit button
12. Update the required fields:
    - Authority Name (Mandatory)
    - Authority Code (Read-only after creation)
    - Status (Active/Inactive)
13. Click Update Grant Authority
14. Click Confirm to save changes    

Delete Grant Authority:

15. Find the grant authority in the list
16. Click the Delete button
17. Confirmation dialog appears:
    - "Delete Grant Authority?" title
    - Shows authority name being deleted
    - "Are you sure you want to delete "Authority Name"? This action cannot be undone."
18. Click Yes, delete! to confirm
19. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Grant Fund Source Master →](/masters/grant-management/grant-authorities-master)'

💡 **Pro Tips:**
- Fund Source Name is mandatory and cannot be left blank.
- Fund Source Code should be unique across all grant fund sources.
- Inactive fund sources will not appear while assigning grants.
- Verify all information before creating the fund source.
- Use meaningful fund source names to easily identify different types of grants.`,
   },

   grant_department_mapping: {
      keywords: [
         'grant department mapping',
         'department mapping',
         'grant department',
         'department assignment',
         'how to create department mapping',
      ],
      response: `📄 **How to Map Departments to Grants:**
  
  1. Go to Masters menu
  2. Click on Grant Management
  3. Select Department-Grant Type Mapping
  4. Click on Add New Department-Grant Type Mapping
  5. Select the Department
  6. Select the Grant Type
  7. Click Create Mapping to save the mapping
  8. Click Cancel to discard the changes

View Mapping:

9. Find the mapping in the list
10. Click the View button 
11. View mapping details:
    - Department - Name and code
    - Budget Heads - List of mapped budget heads
    - Total Heads - Count of mapped budget heads

Edit Mapping:

12. Find the mapping in the list
13. Click the Edit button
14. Update the required fields:
    - Department
    - Budget Heads
15. Click Update Mapping
16. Confirmation dialog shows changes
17. Click Yes, update! to confirm

Delete Mapping:

18. Find the mapping in the list
19. Click the Delete button 
20. Confirmation dialog will appear
21. Click Yes, Delete to confirm
22. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Grant Department Master →](/masters/grant-management/gra-dept-map)'`,
   },

   scheme_master: {
      keywords: [
         'scheme master',
         'create scheme',
         'add scheme',
         'manage scheme',
         'scheme management',
         'how to create scheme master',
         'delete scheme master',
         'edit scheme master',
         'view scheme master',
      ],
      response: `📄 **How to Create a New Scheme:**
    
   1. Go to Masters menu
    2.click on grant management and select scheme master
    3. Click on Add New Scheme
    4. Fill in scheme details:
       - Scheme Name (Mandatory)
       - Scheme Code (Optional)
       - Grant Type (Mandatory)
       - Status (Active/Inactive)
       - Start Date
       - End Date
       - Budget
       - Status (Active / Inactive)
    5. Click Create Scheme
    6. The new scheme will appear in the list
    7. Click **"Confirm"** to finalize

View Scheme:

8. Find the scheme in the list
9. Click the View button 
10. View scheme details:
   - Scheme Code - Unique identifier
   - Scheme Name - Display name
   - Grant Type - Associated grant type (if any)
   - Date Range - Start and End dates
   - Budget - Allocated budget
   - Status - Current status
   - Is Active - Active/Inactive badge

Delete Scheme:

11. Find the scheme in the list
12. Click the Delete button
13. Confirmation dialog appears:
    - "Delete Scheme?" title
    - Shows scheme name being deleted
    - "Are you sure you want to delete "Scheme Name"? This action cannot be undone."
14. Click Yes, delete! to confirm
15. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Scheme Master →](/masters/grant-management/scheme-master)

💡 **Pro Tip:** You can also create schemes from the Quick Actions section on your dashboard!`,
   },

   debt_type_master: {
      keywords: [
         'debt type master',
         'create debt type',
         'add debt type',
         'manage debt type',
         'debt type management',
         'edit debt type master',
         'delete debt type master',
      ],
      response: `📄 **How to Create a New Debt Type:**

   1. Go to Masters menu
   2.click on grant management and select debt type master
   3. Click on Add New Debt Type
   4. Fill in debt type details:
      - Debt Type Name (Mandatory)
      - Debt Type Code (Optional)
      - Debt Category (Mandatory)
      - Status (Active/Inactive)
   5. Click Create Debt Type
   6. The new debt type will appear in the list   7. Click Confirm to finalize

View Debt Type:

8. Find the debt type in the list
9. Click the View button or click on the debt name

10. View debt type details:
   - Debt Code - Unique identifier
   - Debt Name - Display name
   - Debt Category- Long Term/Short Term
   - Liability Type - Payable/Deposit/Loan
   - Status - Active/Inactive badge

Edit Debt Type:

11. Find the debt type in the list
12. Click the Edit button 
13. Update the required fields:
    - Debt Name
    - Debt Code (Read-only in edit mode)
    - Debt Category
    - Liability Type
    - Status toggle

14. Click Update Debt Type
15. Click Confirm to save changes

Delete Debt Type:

15. Find the debt type in the list
16. Click the Delete button 
17. Confirmation dialog appears:
    - "Delete Debt Type?" title
    - Shows debt name being deleted
    - "Are you sure you want to delete "Debt Name"? This action cannot be undone."
18. Click Yes, delete! to confirm
19. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Debt Type Master →] (/masters/grant-management/debt-type-master)'`,
   },

   // tender management

   tender_work_type_master: {
      keywords: [
         'tender work type master',
         'create tender work type',
         'add tender work type',
         'manage tender work type',
         'delete tender work',
         'view tender type work type',
      ],
      response: `📄 **How to Create a New Tender Work Type:**
    
   1. Go to Masters menu
   2.click on tender management and select tender work type master
   3. Click on Add New Tender Work Type
   4. Fill in tender work type details:
      - Tender Work Type Name (Mandatory)
      - Tender Work Type Code (Optional)
      - Status (Active/Inactive)
   5. Click Create Tender Work Type
   6. The new tender work type will appear in the list
   7. Click Confirm to finalize
    
View Tender Work Type:

8. Find the tender work type in the list
9. Click the View button 
10. View tender work details:
   - Work Name - Display name
   - Work Code - Unique identifier (with copy button)
   - Status - Active/Inactive badge

Edit Tender Work Type:

10. Find the tender work type in the list
11. Click the Edit button
12. Update the required fields:
    - Work Name
    - Work Code (Read-only in edit mode)
    - Status toggle
13. Click Update Tender Work
14. Click Confirm to save changes

Delete Tender Work Type:

15. Find the tender work type in the list
16. Click the Delete button
17. Confirmation dialog appears:
    - "Delete Tender Work?" title
    - Shows work name being deleted
    - "Are you sure you want to delete "Work Name"? This action cannot be undone."
18. Click Yes, delete! to confirm
19. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Tender Work Type Master →](/masters/tender-management/tender-work-type)'

💡 **Pro Tip:** You can also create tender work types from the Quick Actions section on your dashboard!`,
   },

   emdbg_type_master: {
      keywords: [
         'emdbg type master',
         'create emdbg type',
         'add emdbg type',
         'manage emdbg type',
         'emdbg type management',
         'view emdbg type',
         'delete emdbg type',
      ],
      response: `📄 **How to Create a New EMDBG Type:**

   1. Go to Masters menu
   2.click on tender management and select emdbg type master
   3. Click on Add New EMDBG Type
   4. Fill in emdbg type details:
       - EMDBG Type Name (Mandatory)
       - EMDBG Type Code (Optional)
       - Status (Active/Inactive)
       - Percentage (Optional)
   5. Click Create EMDBG Type
   6. The new emdbg type will appear in the list
   7. Click Confirm to finalize

View EMDBG Type:

8. Find the EMDBG type in the list
9. Click the View button 
10. View EMDBG type details:
    - EMDBG Type Name - Display name (with copy button)
    - EMDBG Type Code - Unique code (with copy button)
    - EMDBG Type ID - Unique identifier
    - Percentage - Percentage value (with % symbol)
    - Status - Active/Inactive badge
    - Created Date - When EMDBG type was created
    - Last Updated - When EMDBG type was last modified
    - Deleted Date - If EMDBG type was deleted (if applicable)
    - Audit Information - Creation and update timestamps

Edit EMDBG Type:

11. Find the EMDBG type in the list
12. Click the Edit button
13. Update the required fields:
    - EMDBG Type Name (Mandatory)
    - EMDBG Type Code (Read-only after creation)
    - Percentage (Optional)
    - Status (Active/Inactive)
14. Click Update EMDBG Type
15. Click Confirm to save changes    

🔗 **Click here to go:** '[Go to Emdbg type Master →](/masters/tender-management/emdbg-type)'

💡 **Pro Tip:** You can also create emdbg types from the Quick Actions section on your dashboard!`,
   },

   invoice_tax_parameter_master: {
      keywords: [
         'tax parameter',
         'invoice tax parameter',
         'tax setup',
         'create tax parameter',
         'add tax parameter',
         'tax deduction',
         'how to create invoice tax parameter master',
         'delete invoice tax parameter',
      ],
      response: `📄 **How to Create a New Invoice Tax Parameter:**,

1. Go to Masters menu
2. Click on Financial Accounting
3. Select Invoice Tax Parameters
4. Click on Add New Tax Parameters
5. Select the Tender Work
   - Choose the tender work for which tax parameters will apply
6. Select the Effective Date
   - Choose the date from which these tax parameters will become effective
7. Click Add More to add tax parameter entries
8. For each Tax Parameter, provide the following details:
   - Tax Type
   - Add/Deduct
   - Percentage (%)
   - Ledger Account
   - Calculation Formula
9. Repeat Step 8 to configure multiple tax parameters if required
10. Review all entered information
11. Click Create Tax Parameters to save the records
12. Click Cancel to discard the changes and return to the previous page

View Tax Parameter:

13. Find the tax parameter in the list
14. Click the View button 
15. View tax parameter details:
   - Tender Work - Associated tender work type
   - Work Code - Tender work code
   - Effective Date - Start date of parameter
   - Tax Entries - List of all tax configurations
   - Summary Statistics - Count of Add/Deduct/Exempt entries

Edit Tax Parameter:

16. Find the tax parameter in the list
17. Click the Edit button 
18. Update the required fields:
    - Tender Work 
    - Effective Date
    - Tax Entries (Add/Remove/Update)
    - Status toggle

19. Click Update Tax Parameter
20. Click Confirm to save changes

Delete Tax Parameter:

21. Find the tax parameter in the list
22. Click the Delete button 
23. Confirmation dialog appears:
    - "Delete Tax Parameters?" title
    - Shows tender work name
    - "Are you sure you want to delete these tax parameters? This action cannot be undone."
24. Click Yes, delete! to confirm
25. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Invoice Tax Parameter →](/masters/financial-accounting/invoice-tax-parameter)'

💡 **Pro Tips:**
- Tender Work and Effective Date must be selected before tax parameter entries can be added.
- Multiple tax parameters can be configured for a single tender work.
- The Ledger Account and Calculation Formula are generated automatically based on the selected Tax Type.
- Ensure that the tax percentage entered is valid and complies with applicable regulations.
- Verify all tax entries carefully before saving, as they directly impact invoice calculations.`,
   },

   challan_type_master: {
      keywords: [
         'challan type master',
         'create challan type',
         'add challan type',
         'manage challan type',
         'edit challan type',
         'update challan type',
         'delete challan type',
         'how to create challan type',
      ],
      response: `📄 **How to Create a New Challan Type:**

1. Go to Masters menu
  2. Click on Financial Accounting
  3. Select Challan Type Master
  4. Click on Add New Challan Type
  5. Fill in challan type details:
      - Challan Type Name (Mandatory) 
      - Challan Type Code (Optional)
      - Status (Active/Inactive)
  6. Click Create Challan Type
  7. The new challan type will appear in the list
  8. Click Confirm to finalize

View Tax Parameter:

9. Find the tax parameter in the list
10. Click the View button 
11. View tax parameter details:
    - Challan Type - Associated challan type
    - Effective Date - Parameter start date
    - Tax Entries - List of all tax configurations
    - Summary Statistics - Count of Add/Deduct/Exempt entries

Edit Tax Parameter:

12. Find the tax parameter in the list
13. Click the Edit button 
14. Update the required fields:
    - Challan Type (Read-only in edit mode)
    - Effective Date
    - Tax Entries (Add/Remove/Update)
    - Add/Remove tax entries
15. Click Update Tax Parameters
16. Click Confirm to save changes

Delete Tax Parameter:

17. Find the tax parameter in the list
18. Click the Delete button 
19. Confirmation dialog appears
20. Click Yes, delete! to confirm
21. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Challan Type →](/masters/tender-management/challan-type)'

💡 **Pro Tip:** You can also create challan types from the Quick Actions section on your dashboard!`,
   },

   bill_creation: {
      keywords: [
         'bill',
         'create bill',
         'make bill',
         'new bill',
         'generate bill',
         'how to create bill',
         'bill generation',
         'create invoice',
         'make invoice',
         'generate invoice',
         'bill entry',
         'add bill',
         'billing',
         'invoice creation',
         'sales bill',
         'purchase bill',
         'how to make bill',
         'bill kaise banaye',
         'invoice kaise banaye',
      ],
      response: `📄 How to Create a Bill/Invoice:

Method 1: Create Bill from Dashboard
1. Go to the Dashboard or Quick Actions section
2. Click on the "Create Bill" or "New Bill" button
3. Fill in the bill details:
   - Bill Type - Sales / Purchase / Service
   - Customer/Vendor Name - Search or select from list
   - Bill Date - Select the date
   - Due Date - Payment due date
   - Items/Services - Add products or services
   - Quantity - Number of items
   - Rate - Price per unit
   - Tax - Applicable tax rate (GST, VAT, etc.)
   - Discount - Any discount applied
4. Review the bill summary
5. Click "Save" or "Create" to generate the bill

Method 2: Create Bill from Transactions
1. Go to Transactions → Bookkeeping Vouchers
2. Select Receipt Entries or Payment Entries
3. Click "Create Receipt Voucher" or "Create Payment Voucher"
4. Fill in the voucher details with bill information
5. Click "Save" to create the bill entry

🔗 Go to Receipt Entry → [Receipt Voucher →](/transactions/bookkeeping-vouchers/receipt)
🔗 Go to Payment Entry → [Payment Voucher →](transactions/bookkeeping-vouchers/payment-entries)

Method 3: Create Bill from Vendor Payments
1. Go to Transactions → Vendor Payments
2. Select Bill Challan Entry
3. Click "Create Payment Voucher"
4. Fill in:
   - Bill Date
   - Vendor Name
   - Ledger Account
   - Tender Allocation (if applicable)
   - Basic Amount (Bill Amount)
5. Click "Create Payment Voucher" to save

🔗 Go to Vendor Payments → [Bill Challan Entry →](/transactions/vendor-payments/bill-challan-entry)

Bill Fields Explained:
- Bill No. - Auto-generated unique bill number
- Party Name - Customer or vendor name
- GST No. - GST identification number (if applicable)
- Amount - Total bill amount
- Payment Mode - Cash / Bank / Cheque / Online

Pro Tips:
✅ Always verify customer/vendor details before creating bill
✅ Check tax calculations before saving
✅ Save a draft if you need to complete later
✅ Print or email the bill after creation

Voice Commands:
- Say "create bill" to get this guide
- Say "make invoice" for invoice creation help
- Say "generate bill" for bill generation steps

Need help? Click "📞 Call Expert" for assistance!`,
   },


   // financial accounting

   book_of_account: {
      keywords: [
         'book account',
         'ledger master',
         'create ledger',
         'add ledger',
         'new ledger',
         'update ledger',
         'delete ledger',
         'ledger account',
         'manage ledger',
         'account ledger',
      ],
      response: `📄 **How to Create a New Book of Account (Ledger):**
      
1. Go to Masters menu
2. Click on Financial Accounting
3. Select Ledger Master
4. Click on Add New Ledger
5. Enter the Ledger Name
6. Enter the English Name
7. Enter the Ledger Code
8. Select the Group
9. Enter Contact Information
   - Address
   - City
   - PIN Code
   - Phone Number
   - Email Address
10. Set the Ledger Status
    - Active – Ledger can be used in transactions
    - Inactive – Ledger cannot be selected in transactions
11. Review all entered information
12. Click Create Ledger to save the ledger
13. Click Cancel to discard the changes and return to the previous page

View Ledger:

7. Find the ledger in the list
8. Click the View button 
9. View ledger details:
   - Ledger Name - Display name
   - Ledger Code - Unique identifier
   - English Name - English translation (if available)
   - Status - Active/Inactive badge
   - Ledger Group - Associated group
   - Description - Additional notes (if available)

Edit Ledger:

10. Find the ledger in the list
11. Click the Edit button
12. Update the required fields:
    - Ledger Name
    - Ledger Code (Read-only in edit mode)
    - English Name
    - Ledger Group
    - Description
    - Status toggle
13. Click Update Ledger
14. Click Confirm to save changes

Delete Ledger:

15. Find the ledger in the list
16. Click the Delete button
17. Confirmation dialog appears:
    - "Delete Ledger?" title
    - Shows ledger name being deleted
    - "Are you sure you want to delete "Ledger Name"? This action cannot be undone."
18. Click Yes, delete! to confirm
19. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Book accounts →](/masters/financial-accounting/book-accounts)'

💡 **Pro Tips:**
- Ledger Name is mandatory and should clearly identify the account.
- Select the correct Group, as it determines the ledger's classification in financial reports.
- Ledger Codes should be unique to avoid duplicate accounts.
- Contact details are useful for customer, vendor, and bank ledgers.
- Only Active ledgers will be available while creating vouchers and transactions.
- Verify all information before creating the ledger to ensure accurate accounting records.`,
   },

   legder_account: {
      keywords: [
         'ledger account',
         'ledger',
         'account ledger',
         'create ledger account',
         'add ledger account',
         'manage ledger account',
         'how to create ledger account',
         'delete ledger account',
         'edit ledger account',
      ],
      response: `📄 **How to Create a New Ledger Account:**
      
   1. Go to Masters menu
2. Click on Financial Accounting and select Ledger Accounts
3. Click on Add New Ledger
4. Fill in ledger details:
   - Ledger Name (Mandatory)
   - Ledger Code (Optional)
   - Ledger English Name (Optional)
   - Select Group (Mandatory)
   - Select Budget Head (Optional)
   - Select Grant Type (Optional)
   - Sub Ledger (Yes/No)
   - Status (Active/Inactive)
5. Click Create Ledger
6. The new ledger will appear in the list
7. Click Confirm to finalize

Edit Ledger Account:

8. Find the ledger in the list
9. Click the Edit button 
10. Update the required fields:
    - Ledger Name
    - Ledger Code 
    - Ledger English Name
    - Ledger Group
    - Budget Head
    - Grant Type
    - Sub Ledger toggle
    - Status toggle
11. Click Update Ledger
12. Click Confirm to save changes

Delete Ledger Account:

13. Find the ledger in the list
14. Click the Delete button
15. Confirmation dialog appears:
    - "Delete Ledger?" title
    - Shows ledger name being deleted
    - "Are you sure you want to delete "Ledger Name"? This action cannot be undone."
16. Click Yes, delete! to confirm
27. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Ledger Accounting  →](/masters/financial-accounting/ledger-accounts)'

      💡 **Pro Tips:**
      - Ledger Name is mandatory and should clearly identify the account.
      - Select the correct Group, as it determines the ledger's classification in financial reports.
      - Ledger Codes should be unique to avoid duplicate accounts.
      - Contact details are useful for customer, vendor, and bank ledgers.
      - Only Active ledgers will be available while creating vouchers and transactions.
      - Verify all information before creating the ledger to ensure accurate accounting records.`,
   },

   sub_ledger_account: {
      keywords: [
         'sub ledger account',
         'sub ledger',
         'create sub ledger account',
         'add sub ledger account',
         'manage sub ledger account',
         'delete sub ledger account',
         'edit sub ledger account',
         'view sub ledger account',
      ],
      response: `📄 **How to Create a New Sub Ledger Account:**
      
   1. Go to Masters menu
   2. Click on Financial Accounting
   3. Select Sub Ledger Master
   4. Click on Add New Sub Ledger Account
   5. Enter the Sub Ledger Name
   6. Enter the Sub Ledger Code
   7. Enter the SL Type 

   8.Enter Contact Information 
   9. Enter SUB Ledger Status
   10. Review all entered information

   11. click on statutory & legal details and fill the required information
      -PAN Number
      -GST Number
      -GST Include
      -GST Exempt Declaration
      -MSME Udyam Registration No.
      -CIN/LLPIN
      -Shop Act/Trade License No.
      -TAN

   12. Review all entered information
   13. Click on Banking Details and fill the required information
      - Bank Name
      - Branch Name
      - Account Holder Name
      - Account Number
      - IFSC Code
      - Account Type

   14. Review all entered information
   15. Click Create Sub Ledger Account to save the sub ledger account
   16. Click Cancel to discard the changes and return to the previous page

Edit Subledger:

17. Find the subledger in the list
18. Click the Edit button 
19. Update the required fields:
    - Subledger Name
    - Subledger Code (Read-only in edit mode)
    - Contact Person
    - Phone, Email, Address, City
    - Parent Ledgers (Add/Remove)
    - Status toggle

20. Click Update Subledger
21. Click Confirm to save changes

Delete Subledger 

22. Find the subledger in the list
23. Click the Delete button 
24. Confirmation dialog appears:
    - "Delete Subledger?" title
    - Shows subledger name being deleted
    - "Are you sure you want to delete "Subledger Name"? This action cannot be undone."
25. Click Yes, delete! to confirm
26. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Sub ledger Accounts →](/masters/financial-accounting/sub-ledger-accounts)'

💡 **Pro Tips:**
   - Sub Ledger Name is mandatory and should clearly identify the account.
   - Select the correct SL Type, as it determines the sub ledger's classification in financial reports.
    - Sub Ledger Codes should be unique to avoid duplicate accounts.
   - Only Active sub ledgers will be available while creating vouchers and transactions.
   - Verify all information before creating the sub ledger to ensure accurate accounting records.`,
   },

   vendor_invoice: {
      keywords: [
         'vendor invoice',
         'create vendor invoice',
         'add vendor invoice',
         'manage vendor invoice',
         ' add vendor billing',
         'delete vendor billing',
      ],
      response: `📄 **How to Create a New Vendor Invoice:**

   1. Go to Masters menu
   2. Click on Financial Accounting
   3. Click on Vendor Invoice
   4. Click on Add New Vendor Invoice
   5. Fill in vendor invoice details:
      - Ledger  Name (Mandatory)
      - Tax Name (Mandatory)
      - Tax Code (Mandatory)
      - Percentage (Optional)
   6. Click Create Vendor Invoice to save the vendor invoice
   7. Click Cancel to discard the changes and return to the previous page
  
Edit Tax Type:

8. Find the tax type in the list
9. Click the Edit button 
10. Update the required fields:
    - Tax Name (Mandatory)
    - Tax Code (Read-only after creation)
    - Percentage (Optional)
    - Ledger Account (Mandatory)
    - Status (Active/Inactive)
11. Click Update Tax Type
12. Click Confirm to save changes

Delete Tax Type:

13. Find the tax type in the list
14. Click the Delete button
15. Confirmation dialog appears:
    - "Delete Tax Type?" title
    - Shows tax type name being deleted
    - "Are you sure you want to delete "Tax Type Name"? This action cannot be undone."
16. Click Yes, delete! to confirm
17. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Vendor Invoice tax →](/masters/financial-accounting/vendor-invoice-taxes)'

💡 **Pro Tips:**
      - Ensure all mandatory fields are filled before creating the vendor invoice.
      - Double-check the tax details to avoid discrepancies in financial reporting.
      - Keep a record of all vendor invoices for audit purposes.`,
   },

   vendor_invoice_parameter_master: {
      keywords: [
         'vendor invoice parameter master',
         'create vendor invoice parameter',
         'add vendor invoice parameter',
         'manage vendor invoice parameter',
         'vendor invoice configuration',
         'delete vendor invoice parameter master',
         'edit vendor invoice parameter',
      ],
      response: `📄 **How to Create a New Vendor Invoice Parameter:** 
      
   1. Go to Masters menu
   2. Click on Financial Accounting
   3. Click on Vendor Invoice Parameter Master
   4. Click on Add New Vendor Invoice Parameter
   5. Fill in vendor invoice parameter details:
      - Tender work (Mandatory)
      - Effective date (Mandatory)
      - Tax type (Mandatory)
      - Add/Deduct (Mandatory)
      - Percentage (Mandatory)
      - Ledger account (Mandatory)
      - Exempt allow (Mandatory)
      - Calculation formula (Mandatory)
   6. Click Create Tax Parameter to save the vendor invoice parameter
   7. Click Cancel to discard the changes and return to the previous page

Edit Tax Parameter:

8. Find the tax parameter in the list
9. Click the Edit button 
10. Update the required fields:
    - Tender Work (Read-only in edit mode)
    - Effective Date (Can be updated)
    - Tax Entries (Add/Remove/Update existing entries)
    - For each entry: Tax Type, Add/Deduct, Percentage, Ledger Account, Exempt Allow, Formula
11. Click Update Tax Parameter
12. Click Confirm to save changes

Delete Tax Parameter:

13. Find the tax parameter in the list
14. Click the Delete button 
15. Confirmation dialog appears:
    - "Delete Tax Parameters?" title
    - Shows tender work name
    - "Are you sure you want to delete these tax parameters? This action cannot be undone."
16. Click Yes, delete! to confirm
17. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Invoice Tax Parameter →](/masters/financial-accounting/invoice-tax-parameter)'   

Pro Tips:
      - Ensure all mandatory fields are filled before creating the vendor invoice parameter.
      - Double-check the tax details to avoid discrepancies in financial reporting.
      - Keep a record of all vendor invoice parameters for audit purposes.`,
   },

   grant_department_mapping: {
      keywords: [
         'grant department mapping',
         'department mapping',
         'grant department',
         'department assignment',
         'delete grant department',
         'update grant department',
      ],
      response: `📄 **How to Map Departments to Grants:**

   1. Go to Masters menu
   2. Click on Financial Accounting
   3. Click on Grant Management
   4. Select Department-Grant Type Mapping
   5. Click on Add New Department-Grant Type Mapping
   6. Select the Department
   7. Select the Budget Head
   8. Click on Create Mapping to save the mapping


Edit Grant Department Mapping:

9. Find the mapping in the list
10. Click the Edit button 
11. Update the required fields:
    - Department (Read-only in edit mode)
    - Budget Heads (Add/Remove budget heads)
12. Click Update Mapping
13. Confirmation dialog shows changes
14. Click Yes, update! to confirm

Delete Grant Department Mapping:

15. Find the mapping in the list
16. Click the Delete button 
17. Confirmation dialog appears:
    - "Delete Mapping?" title
    - Shows department name being deleted
    - Shows number of budget heads mapped
    - "Are you sure you want to delete this mapping? This action cannot be undone."
18. Click Yes, delete it! to confirm
19. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Grant Department Mapping →](/masters/grant-management/grant-department-mapping)'

    Pro Tips:
    - Ensure all mandatory fields are filled before creating the department-grant type mapping.
    - Double-check the department and budget head details to avoid discrepancies in financial reporting.
    - Keep a record of all department-grant type mappings for audit purposes.`,
   },

   challan_tax_parameters: {
      keywords: [
         'challan tax parameters',
         'tax parameters',
         'challan tax setup',
         'tax configuration',
         'how to create challan tax parameter',
         'update challan tax',
         'edit challan tax',
         'delete challan tax',
      ],
      response: `📄 **How to Configure Challan Tax Parameters:**

    1. Go to Masters menu
    2. Click on Financial Accounting
    3. Select Challan Tax Parameters
    4. Click on Add New Challan Tax Parameter
    5. Fill in the required details:
    - Challan Date (Mandatory)
    - Effective Date (Mandatory)
    - Select Tax Parameters
    - Tax Type
    - Add / deduct
    - Percentage
    - Ledger Account
    - Exempt allow
    - Calculation formula
   6. Click Challan Tax Parameters to save the mapping.

View Tax Parameter:

7. Find the tax parameter in the list
8. Click the View button 
9. View tax parameter details:
    - Challan Type - Associated challan type
    - Effective Date - Parameter start date
    - Tax Entries - List of all tax configurations
    - Summary Statistics - Count of Add/Deduct/Exempt entries

Delete Tax Parameter:

10. Find the tax parameter in the list
11. Click the Delete button 
12. Confirmation dialog appears
13. Click Yes, delete! to confirm
14. Click Cancel to abort deletion
   
🔗 **Click here to go:** '[Go to Challan Tax Parameters →](/masters/financial-accounting/challan-tax-parameters)'`,
   },

   //masters/employee-records

   employee_master: {
      keywords: [
         'employee',
         'employee master',
         'add employee',
         'create employee',
         'new employee',
         'employee details',
         'employee record',
         'staff',
         'employee management',
      ],
      response: `👤 **How to Add a New Employee:**

1. Go to Masters menu
2. Click on Employee Records
3. Select Employee Master
4. Click on Add New Employee

# Basic Information
5. Enter the employee's First Name
6. Enter the Last Name
7. Enter the Employee Code

# Personal Details
8. Select the Birth Date
9. Enter the PAN Number
10. Enter the Aadhaar Number

# Contact Information
11. Enter the Email Address
12. Enter the Phone Number
13. Enter the Alternate Phone Number
14. Select the Gender

# Address Information
15. Enter Address Line 1
16. Enter Address Line 2
17. Enter Address Line 3

# Master Data
18. Select the Department
19. Select the Employee Category
20. Select the Quota
21. Select the Employee Type
22. Select the User
23. Select the Languages Known

# Bank Details
24. Enter the Bank Account Number
25. Enter the Bank Name
26. Enter the Bank Branch
27. Enter the Account Type

# PF/GPF Details
28. Select the GPF Profile
29. Enter the GPF Number
30. Enter the CPF Number

#Status
31. Select the employee status:
   - Active
   - Inactive

32. Review all entered details carefully.
33. Click Create Employee to save the employee record.
34. Click Cancel to discard the changes and return to the previous page.

Edit a Tax Parameter:

1.Navigate to Masters → Financial Accounting → Challan Tax Parameters
2.Locate the tax parameter in the list.
3.Click the Edit button for that parameter

Delete a Tax Parameter:

1.Navigate to Masters → Financial Accounting → Challan Tax Parameters
2.Locate the tax parameter in the list
3.Click the Delete button  for that parameter
4.Confirmation dialog appears:
- "Are you sure you want to delete this tax parameter?"
- Click Yes, delete! to confirm deletion
- Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Employee Master →](/masters/employee-records/employee-master)'
💡 **Pro Tips:**
- First Name is mandatory for creating an employee.
- Use a unique Employee Code to avoid duplicate employee records.
- Ensure PAN and Aadhaar numbers are entered correctly for statutory compliance.
- Assign the correct Department, Employee Category, and Employee Type for accurate reporting.
- Verify Bank and PF/GPF details before saving to ensure correct payroll processing.
- Only Active employees will be available for attendance, payroll, and other HRMS operations.`,
   },

   employee_profile_add: {
      keywords: [
         'employee profile',
         'add employee profile',
         'create employee profile',
         'new employee profile',
         'profile update',
         'employee profile add',
         'employee profile creation',
         'how to create employee profile data',
         'update employee profile',
         'delete employee profile',
      ],
      response: `👤 **How to Add a New Employee Profile:**

1. Go to Masters menu
2. Click on Employee Records
3. Select Employee Profile Update
4. Click on Add New Employee Profile
5. Select Employee (Mandatory)
6. Enter Joining Date
   - Select the date when the employee joined
7. Select Employee Type
   - Choose from the dropdown (e.g., Permanent, Contract, etc.)
8. Select Employee Status
   - Choose the current employment status
9. Select Department(s) (Mandatory)
   - Multiple departments can be selected
10. Select Designation
    - Available based on selected department(s)
    
11. Select Pay Bill
    - Choose the appropriate pay bill category

12. Select City Grade
    - Choose based on city classification

13. Select Grade (Mandatory)
    - Choose the employee's grade/pay scale

14. View Pay Band
    - Auto-filled from grade selection (read-only)

15. Select Basic (Pay Matrix)
    - Available based on selected grade
    - Search by cell index or basic pay amount

16. Select Week Off Pattern
    - Choose the employee's weekly off pattern

17. Enter Post-Effective Date
    - Date from which the profile becomes effective

18. View Increment Month
    - Auto-calculated from post-effective date (Jan/Jul)
19. Select CPF/NPS Option
    - C = CPF
    - N = NPS
    - G = GPF
20. Enter NPS Percentage
    - Required if NPS is selected (0-100%)
21. Review all entered details carefully
22. Click Save Profile to create the employee profile
23. Click Cancel to discard changes and return

Edit an Employee Profile :

1.Navigate to Masters → Employee Records → Employee Profile Update
2.Locate the profile update in the list
3.Click the Edit button  for that profile

Delete a Profile Update:

1.Navigate to Masters → Employee Records → Employee Profile Update
2.Locate the profile in the list
3.Click the Delete button  for that profile
4."Are you sure you want to delete this profile?"
5.Shows employee name and code for confirmation
6.Click Yes, delete! to confirm deletion
7.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Employee Profile Update →](/masters/employee-records/emp-profile-update)'
💡 **Pro Tips:**
- Employee, Department, and Grade are mandatory fields
- Auto-fill features save time - Pay Band auto-fills from Grade
- NPS Percentage must be between 0 and 100
- HBA and MCA Interest must be between 0 and 100`,
   },
   // administrative masters
   designation_master: {
      keywords: [
         'designation',
         'designation master',
         'add designation',
         'create designation',
         'new designation',
         'edit designation',
         'delete designation',
         'update designation',
         'view designation',
      ],
      response: `🏷️ **Designation Master - Quick Guide:**

1. Go to Masters → Administrative Masters → Designation Master
2. Click Add Designation
3. Parent Designation
   - Select parent for child designation (L2-L10)
4. Departments
   - Select multiple departments
5. Description (Mandatory)
   - Enter primary name (Gujarati/regional)
6. English Name
   - Enter English translation
7. Click Create Designation to save

Edit a Designation:

1.Navigate to Masters → Administrative Masters → Designation Master
2.Locate the designation in the hierarchy
3.Click the Edit button for that designation

Delete a Designation:

1.Navigate to Masters → Administrative Masters → Designation Master
2.Locate the designation in the list
3.Click the Delete button for that designation
4.Confirmation dialog appears
5.Click OK to confirm deletion
6.The designation is permanently removed

🔗 **Click here to go:** '[Go to Designation Master →](/masters/administrative-masters/designation-master)'

 **Pro Tips:**
- Plan hierarchy before creating
- Parent cannot be changed after creation
- Hide instead of delete for archiving
- Max 10 levels (L1-L10)
- Group codes auto-generate`,
   },

   employee_type_master: {
      keywords: [
         'employee type',
         'employee type master',
         'add employee type',
         'create employee type',
         'new employee type',
         'employee type details',
         'employment type',
         'type management',
         'update employee type master',
         'delete employee type master',
         'contract employee',
      ],
      response: `👤 **Employee Type Master - Quick Guide:**

1. Go to Masters → Administrative Masters → Employee Type Master
2. Click Add Employee Type
3. Type Code
   - Enter a unique code (e.g., FULLTIME, CONTRACT)
4. Type Name
   - Enter the employee type name
5. Status
   - Active - Type available for selection
   - Inactive - Type hidden from selection
6. Click Create Type to save
7. Click Cancel to discard

Edit an Employee Type:

1.Navigate to Masters → Administrative Masters → Employee Type Master
2.Locate the employee type in the list
3.Click the Edit button for that type

Delete an Employee Type:

1.Navigate to Masters → Administrative Masters → Employee Type Master
2.Locate the employee type in the list
3.Click the Delete button  for that type
4.Confirmation dialog appears:
5."Are you sure you want to delete '[Type Name]'?"
6.Shows number of employees using this type (if any)
7.Click Yes, delete! to confirm deletion
8.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Employee Type Master →](/masters/administrative-masters/employee-type-master)'

💡 **Pro Tips:**
- Type Name is mandatory
- Code is optional but helps in identification
- Inactive types won't appear in dropdowns
- Use consistent naming conventions`,
   },

   employee_category_master: {
      keywords: [
         'employee category',
         'employee category master',
         'add employee category',
         'create employee category',
         'new employee category',
         'category management',
         'employee classification',
         'delete employee category master',
         'update employee category master',
      ],
      response: `📂 **Employee Category Master - Quick Guide:**

1. Go to Masters → Administrative Masters → Employee Category Master
2. Click Add Employee Category
3. Category Code
   - Enter a unique code (e.g., PERM, TEMP, CONT)
   - Max 20 characters
4. Category Name (Mandatory)
   - Enter the employee category name
5. Status
   - Active - Category available for selection
   - Inactive - Category hidden from selection
6. Click Create Category to save
7. Click Cancel to discard

Edit an Employee Type:

1.Navigate to Masters → Administrative Masters → Employee Type Master
2.Locate the employee type in the list
3.Click the Edit button  for that type

Delete an Employee Type:

1.Navigate to Masters → Administrative Masters → Employee Type Master
2.Locate the employee type in the list
3.Click the Delete button for that type
4."Are you sure you want to delete '[Type Name]'?"
5.Shows number of employees using this type (if any)
6.Click Yes, delete! to confirm deletion
7.Click Cancel to abort the deletion

💡 **Pro Tips:**
- Category Name is mandatory
- Code is optional but helps in identification
- Inactive categories won't appear in dropdowns
- Categories help classify employees for reporting
- Use consistent naming for better organization`,
   },

   employee_quota_master: {
      keywords: [
         'employee quota',
         'create employee quota',
         'delete employee quota',
         'edit employee quota',
         'view employee quota',
         'employee quota master',
      ],
      response: ` **Employee Quota Master - Quick Guide:**

   1.Go to Masters menu -> Click on Administrative Masters -> Select Employee Quota Master -> Click on Add New Employee Quota button
   2.Enter Quota Code 
   3.Enter Quota Name
   4.Enter Percentage 
   5.Set Status (Active / Inactive)
   6.Click Create Quota button
   7.Click Yes, create! to save

Edit an Employee Quota:

1.Navigate to Masters → Administrative Masters → Employee Quota Master
2.Locate the quota in the list
3.Click the Edit button for that quota
4.The quota details will load in the edit form

Delete an Employee Quota:

1.Navigate to Masters → Administrative Masters → Employee Quota Master
2.Locate the quota in the list
3.Click the Delete button for that quota
4.Confirmation dialog appears:
   - "Delete Employee Quota?"
   - "Are you sure you want to delete "[Quota Name]"? This action cannot be undone."
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Employee Quota Master →](/masters/administrative-masters/employee-quota-master)'`,
   },

   education_qualification_master: {
      keywords: [
         'education qualification',
         'education qualification master',
         'add education',
         'create education',
         'new education qualification',
         'education details',
         'qualification management',
         'academic qualification',
      ],
      response: `🎓 **Education Qualification Master - Quick Guide:**

1. Go to Masters → Administrative Masters → Education Qualification Master
2. Click Add Education Qualification
3. Qualification Code
   - Enter a unique code (e.g., BSC01, MSC01, EXM001)
4. Qualification Name (Mandatory)
   - Enter the qualification name
5. Is Mandatory (Radio - Yes/No)
   - Yes - Qualification is mandatory
   - No - Qualification is optional
6. Is Technical
   - Yes - Technical qualification
   - No - Non-technical qualification
7. Is Professional
   - Yes - Professional qualification
   - No - Non-professional qualification
8. Is Promotional
   - Yes - Promotional qualification
   - No - Non-promotional qualification
9. Record Valid
   - Yes - Record is valid
   - No - Record is invalid
10. Status
    - Active - Qualification available for selection
    - Inactive - Qualification hidden from selection
11. Click Create Qualification to save
12. Click Cancel to discard

Edit an Education Qualification:

1.Navigate to Masters → Administrative Masters → Education Qualification Master
2.Locate the qualification in the list
3.Click the Edit button for that qualification

How to Delete an Education Qualification:

1.Navigate to Masters → Administrative Masters → Education Qualification Master
2.Locate the qualification in the list
3.Click the Delete button for that qualification
4."Are you sure you want to delete '[Qualification Name]'?"
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Education Qualification Master →](/masters/administrative-masters/education-qualification-master)'

# 💡 Pro Tips:
- Qualification Name is mandatory
- Code is optional but helps in identification
- Use radio buttons to set qualification flags
- Inactive qualifications won't appear in dropdowns
- Technical/Professional flags help in filtering`,
   },

   tax_slab_master: {
      keywords: [
         'tax slab',
         'tax slab master',
         'add tax slab',
         'create tax slab',
         'new tax slab',
         'income tax slab',
         'create tax slab master',
         'tax rate',
         'tax calculation',
         'delete tax slab master',
         'view tax slab master',
      ],
      response: `📊 **Tax Slab Master - Quick Guide:**

1. Go to Masters → Administrative Masters → Tax Slab
2. Click Add Tax Slab
3. Select Financial Year
4. Select Tax Name 
5. Enter Tax Code 
6. Enter From Amount (₹)
7. Enter To Amount (₹)
8. Enter Tax Rate (%)
9. Enter Standard Deduction (₹)
10. Enter Cess (%)
11. Enter Cess Amount (₹)
12. Click Create Tax Slab

Edit a Tax Slab:

1.Navigate to Masters → Administrative Masters → Tax Slab Master
2.Locate the tax slab in the list
3.Click the Edit button for that slab

Delete a Tax Slab:

1.Navigate to Masters → Administrative Masters → Tax Slab Master
2.Locate the tax slab in the list
3.Click the Delete button for that slab
4."Are you sure you want to delete this tax slab?"
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Tax Slab  →](/masters/administrative-masters/tax-slab)'`,
   },

   house_type_master: {
      keywords: [
         'house type',
         'house type master',
         'add house type',
         'create house type',
         'new house type',
         'house type management',
         'flat rate',
         'standard rate',
         'economic rate',
         'market rate',
         'municipal tax',
      ],
      response: ` **House Type Master - Quick Guide:**

1. Go to Masters → Administrative Masters → House Type
2. Click Add New House Type
3. Enter House Code
   - Unique code for identification
4. Enter House Type Name (Mandatory)
   - Example: Bungalow, Flat, Villa, Apartment
5. Enter Flat Rate (₹)
   - Flat rate for the house type
6. Enter Standard Rate (₹)
   - Standard rate applicable
7. Enter Economic Rate (₹)
   - Economic rate for lower income
8. Enter Market Rate (₹)
   - Current market rate
9. Enter Municipal Tax (₹)
   - Tax applicable for municipality
10. Click Create House Type to save
11. Click Cancel to discard

Edit a House Type:

1.Navigate to Masters → Administrative Masters → House Type Master
2.Locate the house type in the list
3.Click the Edit button for that type

Delete a House Type:

1.Navigate to Masters → Administrative Masters → House Type Master
2.Locate the house type in the list
3.Click the Delete button for that type
4."Are you sure you want to delete this house type?"
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to House Type Master →](/masters/administrative-masters/house-type)'

💡 **Pro Tips:**
- House Type Name is mandatory
- All rate fields are optional
- Rates help in property valuation
- Municipal Tax used for tax calculation`,
   },

   city_grade_master: {
      keywords: [
         'city grade',
         'city grade master',
         'add city grade',
         'create city grade',
         'new city grade',
         'view city grade master',
         'delete city grade master',
         'update city master',
         'municipal city grade',
      ],
      response: `🏙️ **City Grade Master - Quick Guide:**

1. Go to Masters → Administrative Masters → City Grade
2. Click Add New City Grade
3. Enter City Name 
   - Example: Ahmedabad, Surat, Vadodara
4. Enter Grade 
5. Click Create City Grade to save
6. Click Cancel to discard

Edit a City Grade:

1.Navigate to Masters → Administrative Masters → City Grade Master
2.Locate the city grade in the list
3.Click the Edit button for that grade

Delete a City Grade:

1.Navigate to Masters → Administrative Masters → City Grade Master
2.Locate the city grade in the list
3.Click the Delete button for that grade
4."Are you sure you want to delete this city grade?"
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to City Grade Master →](/masters/administrative-masters/city-grade)'

💡 **Pro Tips:**
- City Name and Grade are mandatory
- Grade helps in classification
- Used for property tax calculation
- Used for house type classification`,
   },

   city_hra_cla_master: {
      keywords: [
         'city hra',
         'city hra cla',
         'city hra master',
         'add city hra',
         'create city hra',
         'new city hra',
         'hra rates',
         'cla rates',
         'house rent allowance',
         'city compensatory allowance',
      ],
      response: ` **City HRA/CLA Master - Quick Guide:**

1. Go to Masters → Administrative Masters → City HRA/CLA
2. Click Add New City HRA/CLA

3. Select City Grade 
4. Basic From (₹)
5. Basic To (₹)
6. HRA1 (₹)
7. CLA 1 (₹)
8. HRA Minimum (₹)
9. HRAUT24 (₹)
10. HRAUT49 (₹)
11. HRAAB49 (₹)
12. HRA6TH (₹)
13. HRA7TH (₹)
14. Click Create Record to save
15. Click Cancel to discard

Edit a City HRA/CLA Record:

1.Navigate to Masters → Administrative Masters → City HRA/CLA Master
2.Locate the record in the list
3.Click the Edit button  for that record

Delete a City HRA/CLA Record:

1.Navigate to Masters → Administrative Masters → City HRA/CLA Master
2.Click the Delete button for that record
3."Are you sure you want to delete this record?"
4.Click Yes, delete! to confirm deletion
5.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to City HRA CLA Master →](/masters/administrative-masters/city-hra-cla)'

💡 **Pro Tips:**
- City Grade is mandatory
- Basic To must be > Basic From
- All amounts are optional
- Used for employee payroll calculations
- Different HRA types for different pay commissions`,
   },

   pay_bill_master: {
      keywords: [
         'pay bill',
         'paybill master',
         'pay bill master',
         'add pay bill',
         'create pay bill',
         'new payroll bill',
         'paybill code',
         'payroll bill management',
         'salary bill',
         'payroll category',
      ],
      response: ` **Payroll Bill Master - Quick Guide:**

1. Go to Masters → Administrative Masters → Paybill Master
2. Click Add New Payroll Bill
3. PayBill Code 
   - Enter unique alphanumeric code
4. Description
   - Brief description of payroll bill
5. Ledger
   - Select ledger from hierarchical dropdown
6. Click Create Payroll Bill to save
7. Click Cancel to discard

Edit a City HRA/CLA Record:

1.Navigate to Masters → Administrative Masters → City HRA/CLA Master
2.Click the Edit button for that record

Delete a City HRA/CLA Record:

1.Navigate to Masters → Administrative Masters → City HRA/CLA Master
2.Click the Delete button for that record
3."Are you sure you want to delete this record?"
4.Click Yes, delete! to confirm deletion
5.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Pay Bill Master →](/masters/administrative-masters/paybill-master)'

💡 **Pro Tips:**
- PayBill Code is mandatory and must be unique
- Use descriptive codes for easy identification
- Description helps in understanding the bill type
- Ledger is optional but recommended for accounting
- Hierarchical ledger view with indentation`,
   },

   designation_post_book: {
      keywords: [
         'designation post book',
         'des post book',
         'add designation post',
         'create post book',
         'new post entry',
         'designation posts',
         'permanent post',
         'temporary post',
         'post book management',
         'designation post book master',
      ],
      response: ` **Designation Post Book - Quick Guide:**

1. Go to Masters → Administrative Masters → Des Post Book
2. Click 
3. Select Designation
   - Search by title, name, description, or code
4. Select Date 
5. Permanent Post 
6. Temporary Post
7. Click Create Entry to save
8. Click Cancel to discard

Edit a Designation Post Book Entry:

1.Navigate to Masters → Administrative Masters → Designation Post Book
2.Click the Edit button for that entry

Delete an Designation Post Book Entry:

1.Navigate to Masters → Administrative Masters → Designation Post Book
2.Click the Delete button for that entry
3."Are you sure you want to delete this entry?"
4.Click Yes, delete! to confirm deletion
5.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Designation Post Book →](/masters/administrative-masters/des-post-book)'

💡 **Pro Tips:**
- Designation and Date are mandatory
- Permanent and Temporary posts are optional
- Total Posts auto-calculated
- Hierarchical designation view with levels
- Used for workforce planning`,
   },

   emp_group_insurance: {
      keywords: [
         'employee group insurance',
         'group insurance',
         'add insurance',
         'create insurance',
         'new insurance',
         'insurance record',
         'gis',
         'create group insurance scheme',
         'update insurance management',
         'delete insurance management',
      ],
      response: ` **Employee Group Insurance - Quick Guide:**

1. Go to Masters → Employee Records → Emp Group Insurance
2. Click Add New Insurance
3. Select Effective Date
4. Select Pay Commission
5. Enter Group Code
6. Enter Insurance Amount 
7. Enter Savings Amount 
8. Click Create Insurance

Edit an Employee Group Insurance Record:

1.Navigate to Masters → Employee Records → Employee Group Insurance
2.Click the Edit button for that record

Delete an Insurance Record:

1.Navigate to Masters → Employee Records → Employee Group Insurance
2.Locate the record in the list
3.Click the Delete button for that record
4."Are you sure you want to delete this insurance record?"
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Employee Group Insurance Master →](/masters/employee-records/emp-group-insurance)'

💡 **Pro Tips:**
- Effective Date is mandatory
- All other fields are optional
- Amounts support decimal values`,
   },

   //payroll-pay-structures

   pay_commission_master: {
      keywords: [
         'pay commission',
         'pay commission master',
         'add pay commission',
         'create pay commission',
         'new pay commission',
         'commission master',
         'delete commission master',
         'edit commission master',
         'update commission master',
      ],
      response: `📊 **Pay Commission Master - Quick Guide:**

1. Go to Masters → Payroll Pay Structures → Pay Commission Master
2. Click Add New Pay Commission

📝 Add Pay Commission:
3. Enter Pay Commission Name
4. Select Pay Structure Type
5. Select Effective From
6. Select Effective To
7. Enter Description
8. Set Status
9. Click Create Commission

Edit a Pay Commission:

1.Navigate to Masters → Payroll & Pay Structures → Pay Commission Master
2.Locate the pay commission in the list
3.Click the Edit button for that commission

Delete a Pay Commission:

1.Navigate to Masters → Payroll & Pay Structures → Pay Commission Master
2.Locate the pay commission in the list
3.Click the Delete button  for that commission
4."Are you sure you want to delete this pay commission?"
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Pay Commission Master →](/masters/payroll-pay-structures/pay-commission-master)'

💡 **Pro Tips:**
- Name and Effective From are mandatory
- Leave Effective To empty if currently active
- Inactive commissions won't appear in dropdowns
- Used in employee profiles and payroll`,
   },

   pay_structure_type_master: {
      keywords: [
         'pay structure type',
         'pay structure type master',
         'add pay structure type',
         'create pay structure type',
         'new pay structure',
         'payroll structure type',
         'salary structure',
         'pay type',
         'monthly salary',
         'hourly pay',
         'contract pay',
      ],
      response: `📋 **Pay Structure Type Master - Quick Guide:**

1. Go to Masters → Payroll Pay Structures → Pay Structure Type Master
2. Click Add New Pay Structure Type
Add Pay Structure Type:
3. Enter Pay Structure Type
   - Example: Monthly, Hourly, Annual, Contract
4. Click Create Type

Edit a Pay Structure Type:

1.Navigate to Masters → Payroll & Pay Structures → Pay Structure Type Master
2.Locate the pay structure type in the list
3.Click the Edit button for that type
4.The type details will load in the edit form

-- Editable Fields:

5.Pay Structure Type - Can be updated (must be unique)
6.Click Update Type to save changes
7.Click Yes, update! in the confirmation dialog

Delete a Pay Structure Type:

1.Navigate to Masters → Payroll & Pay Structures → Pay Structure Type Master
2.Locate the pay structure type in the list
3.Click the Delete button  for that type
4."Are you sure you want to delete this pay structure type?"
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Pay Structure Type Master →](/masters/payroll-pay-structures/pay-structure-type-master)'

💡 **Pro Tips:**
- Type name is mandatory
- Must be unique
- Max 30 characters
- Used in Pay Commission and Employee Profiles`,
   },

   pay_band_master: {
      keywords: [
         'pay band',
         'pay band master',
         'add pay band',
         'create pay band',
         'new pay band',
         'salary band',
         'create pay band master',
         'pay level',
         'pay commission band',
         'minimum pay',
         'maximum pay',
      ],
      response: `📊 **Pay Band Master - Quick Guide:**

1. Go to Masters → Payroll Pay Structures → Pay Band Master
2. Click Add New Pay Band
3. Select Pay Commission 
4. Enter Pay Band Code 
   - Example: PB-1, Level-1, Grade-Pay
5. Enter Minimum Pay (₹) 
6. Enter Maximum Pay (₹) 
   - Must be greater than Minimum Pay
7. Click "Create Pay Band"

Edit a Pay Band:

1.Navigate to Masters → Payroll & Pay Structures → Pay Band Master
2.Locate the pay band in the list
3.Click the Edit button  for that band

Delete a Pay Band:

1.Navigate to Masters → Payroll & Pay Structures → Pay Band Master
2.Locate the pay band in the list
3.Click the Delete button  for that band
4."Are you sure you want to delete this pay band?"
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to pay band master →](/masters/payroll-pay-structures/pay-band-master)'

💡 **Pro Tips:**
- All fields are mandatory
- Maximum Pay must be greater than Minimum Pay
- Pay Band Code must be unique under the commission
- Used in Employee Grade and Pay Matrix
- Amounts support decimal values`,
   },

   grade_pay_master: {
      keywords: [
         'grade pay',
         'grade pay master',
         'add grade',
         'create grade',
         'new grade',
         'grade master',
         'pay grade',
         'salary grade',
         'employee grade',
      ],
      response: `📊 **Grade Pay Master - Quick Guide:**

1. Go to Masters → Payroll Pay Structures → Grade Pay Master
2. Click "Add New Grade"
3. Select Employee Grade 
4. Enter Cell Index
5. Select Basic Pay
6. Click "Create Pay Matrix"

Edit a Pay Matrix:

1.Navigate to Masters → Payroll & Pay Structures → Pay Matrix Master
2.Locate the pay matrix record in the list
3.Click the Edit button for that record

Delete a Pay Matrix Record:

1.Navigate to Masters → Payroll & Pay Structures → Pay Matrix Master
2.Locate the record in the list
3.Click the Delete button for that record
4.Confirmation dialog appears:
5."Are you sure you want to delete this pay matrix record?"
6.Click Yes, delete! to confirm deletion
7.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Grade Pay Master →](/masters/payroll-pay-structures/grade-pay-master)'

💡 **Pro Tips:**
- All fields are mandatory
- Grade Code must be unique
- Pay Band determines salary range
- Used in Employee Profile Update
- Inactive grades won't appear in dropdowns`,
   },

   pay_matrix_master: {
      keywords: [
         'pay matrix',
         'pay matrix master',
         'add pay matrix',
         'create pay matrix',
         'new pay matrix',
         'pay matrix entry',
         'salary matrix',
         'pay scale matrix',
         'grade pay matrix',
      ],
      response: `📊 **Pay Matrix Master - Quick Guide:**

1. Go to Masters → Payroll Pay Structures → Pay Matrix
2. Click "Add New Pay Matrix"
3. Select Employee Grade *(Mandatory)*
4. Enter Cell Index *(Mandatory, max 3 digits)*
5. Enter Basic Pay (₹) *(Mandatory)*
6. Click "Create Pay Matrix"

Edit Pay Matrix Entry:

7. Find the pay matrix entry in the list
8. Click the Edit button
9. Update the required fields:
    - Employee Grade 
    - Cell Index 
    - Basic Pay 
10. Click Update Pay Matrix
11. Click Confirm to save changes

Delete Pay Matrix Entry:

12. Find the pay matrix entry in the list
13. Click the Delete button
14. Confirmation dialog appears:
    - "Delete Pay Matrix Entry?" title
    - Shows Grade name and Cell Index being deleted
    - "Are you sure you want to delete Pay Matrix entry for Grade "Grade Name" - Cell {Cell Index}? This action cannot be undone."
15. Click Yes, delete! to confirm
16. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Pay Matrix Master →](/masters/payroll-pay-structures/pay-matrix)'

💡 **Pro Tips:**
- All fields are mandatory
- Grade, Cell Index, and Basic Pay combination must be unique
- Cell Index must be a positive integer
- Basic Pay supports decimal values
- Used in Employee Profile for salary calculation
- Cannot delete if referenced in employee profiles`,
   },

   allowances_deductions_master: {
      keywords: [
         'allowances deduction master',
         'deductions',
         'allowances master',
         'deductions master',
         'add allowance',
         'add deduction',
         'create allowance',
         'create deduction',
      ],
      response: `📊 **Allowances & Deductions Master - Quick Guide:**

1. Go to Masters → Payroll Pay Structures → Allowances & Deductions Master
2. Click "Add New Allowance/Deduction"
3. Enter Code 
4. Enter Short Name 
5. Enter Full Name 
6. Enter Percentage 
7. Select Type 
8. Click Create Allowance/Deduction

Edit an Allowance/Deduction:

1.Navigate to Masters → Payroll & Pay Structures → Allowances & Deductions Master
2.Locate the record in the list
3.Click the Edit button for that record

Delete an Allowance/Deduction:

1.Navigate to Masters → Payroll & Pay Structures → Allowances & Deductions Master
2.Locate the record in the list
3.Click the Delete button for that record
4."Are you sure you want to delete this record?"
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Allowances Deduction Master →](/masters/payroll-pay-structures/allowances-deductions-master)'

💡 **Pro Tips:**
- All fields are mandatory
- Code must be unique
- Percentage between 0-100
- Type determines Allowance or Deduction
- Used in payroll processing
- Inactive items won't appear in dropdowns`,
   },

   ta_ma_rate_master: {
      keywords: [
         'ta rate',
         'ma rate',
         'ta ma rate',
         'travel allowance',
         'medical allowance',
         'ta ma rate master',
         'add ta rate',
         'create ta rate',
         'travel allowance rate',
         'medical allowance rate',
      ],
      response: `📊 **TA/MA Rate Master - Quick Guide:**

1. Go to Masters → Payroll Pay Structures → TA/MA Rate Master
2. Click Add New TA-MA Rate
3. Select Effective Date 
4. Select Employee Grade
5. Select City Grade
6. Enter TA Amount (₹)
7. Enter MA Amount (₹)
8. Click Create Rate

Edit a TA-MA Rate:

1.Navigate to Masters → Payroll & Pay Structures → TA-MA Rate Master
2.Locate the rate record in the list
3.Click the Edit button for that record
4.The rate details will load in the edit form

Delete a TA-MA Rate Record:

1.Navigate to Masters → Payroll & Pay Structures → TA-MA Rate Master
2.Locate the record in the list
3.Click the Delete button  for that record
4..Confirmation dialog appears:
5."Are you sure you want to delete this rate record?"
6.Click Yes, delete! to confirm deletion
7.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to DA-HRA-TA-RATE-Master →](/masters/payroll-pay-structures/da-hra-ta-rate-master)'

💡 **Pro Tips:**
- All fields are optional
- TA + MA = Total Amount (auto-calculated)
- Used in employee payroll
- Searchable dropdowns with keyboard navigation
- Changes tracked in edit mode`,
   },

   //employee-personal-masters
   relationship_master: {
      keywords: [
         'relationship',
         'relationship master',
         'add relationship',
         'create relationship',
         'new relationship',
         'relation',
         'family relation',
         'relationship type',
         'employee relationship',
      ],
      response: ` **Relationship Master - Quick Guide:**

1. Go to Masters → Employee Personal Masters → Relationship Master
2. Click Add New Relationship
3. Enter Relationship Name 
4. Enter Relationship Code 
5. Set Status 
6. Click Create Relationship

Edit a Relationship:

1.Navigate to Masters → Employee Personal Masters → Relationship Master
2.Locate the relationship in the list
3.Click the Edit button  for that relationship

Delete a Relationship:

1.Navigate to Masters → Employee Personal Masters → Relationship Master
2.Locate the relationship in the list
3.Click the Delete button for that relationship
4."Are you sure you want to delete this relationship?"
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Relationship Master →](/masters/employee-personal-masters/relationship-master)'

💡 **Pro Tips:**
- Name and Code are mandatory
- Code should be unique
- Used in employee family details
- Inactive relationships won't appear in dropdowns
- Used for nominee and family records`,
   },

   emp_family_info: {
      keywords: [
         'family info',
         'employee family',
         'family information',
         'add family member',
         'create family member',
         'employee family details',
         'create employee family details',
         'update employee family details',
         'employee family info',
         'edit employee family details',
         'delete employee family details',
      ],
      response: ` **Employee Family Information - Quick Guide:**

1. Go to Masters → Employee Personal Masters → Emp Family Info
2. Click Add New Family Information
3. Select Employee 
4. Enter Member Name 
5. Select Gender 
6. Select Relationship
7. Select Date of Birth 
8. Enter Phone 
9. Select Status 
10. Click Create Family Information

Edit a Family Member Record:

1.Navigate to Masters → Employee Personal Masters → Employee Family Information
2.Locate the record in the list
3.Click the Edit button for that record
4.The record details will load in the edit form

Delete a Family Member Record:

1.Navigate to Masters → Employee Personal Masters → Employee Family Information
2.Locate the record in the list
3.Click the Delete button for that record
4."Are you sure you want to delete this family information?"
5.Shows employee and member name for confirmation
6.Click Yes, delete! to confirm deletion
7.Click Cancel to abort the deletion

💡 **Pro Tips:**
- Employee and Member Name are mandatory
- Relationship comes from Relationship Master
- DOB cannot be in future
- Phone accepts only numbers
- Used for employee family records and nomination`,
   },

   //performance-discipline-masters

   award_master: {
      keywords: [
         'award',
         'award master',
         'add award',
         'create award',
         'new award',
         'award management',
         'employee award',
         'performance award',
         'update award',
         'delete award',
         'edit award',
         'view award',
      ],
      response: `🏆 **Award Master - Quick Guide:**

1. Go to Masters → Performance & Discipline Masters → Award
2. Click "Add New Award"
3. Enter Award Name (Mandatory)
4. Enter Award Code 
5. Enter Award Year 
6. Enter Awarding Authority
7. Select Status 
8. Click Create Award

Edit an Award:

1.Navigate to Masters → Performance & Discipline Masters → Award Master
2.Locate the award in the list
3.Click the Edit button for that award
4.The award details will load in the edit form

Delete an Award:

1.Navigate to Masters → Performance & Discipline Masters → Award Master
2.Locate the award in the list
3.Click the Delete button for that award
4."Are you sure you want to delete this award?"
5.Shows award name for confirmation
6.Click Yes, delete! to confirm deletion
7.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Award Master →] (/masters/performance-discipline-masters/award)'

💡 **Pro Tips:**
- Award Name is mandatory
- Code auto-suggestions from name
- Year must be 4 digits
- Used for employee recognition and performance tracking
- Inactive awards won't appear in dropdowns`,
   },

   special_duty_master: {
      keywords: [
         'special duty',
         'special duty master',
         'add special duty',
         'create special duty',
         'new special duty',
         'duty management',
         'special duty assignment',
         'election duty',
         'edit special duty',
         'update special duty',
         'view special duty',
      ],
      response: `📋 **Special Duty Master - Quick Guide:**

1. Go to Masters → Performance & Discipline Masters → Special Duty
2. Click Add New Special Duty
3. Enter Duty Name
4. Enter Duty Code 
5. Select Start Date 
6. Select End Date 
7. Enter Description 
8. Toggle Has Fees
9. Toggle Is Reimbursable 
10. Toggle Status 
11. Click Create Duty

Edit a Special Duty:

1.Navigate to Masters → Performance & Discipline Masters → Special Duty Master
2.Locate the special duty in the list
3.Click the Edit button for that duty
4.The duty details will load in the edit form

Delete a Special Duty:

1.Navigate to Masters → Performance & Discipline Masters → Special Duty Master
2.Locate the special duty in the list
3.Click the Delete button for that duty
4."Delete Special Duty?"
5."Are you sure you want to delete "[Duty Name]"? This action cannot be undone."
6.Click Yes, delete! to confirm deletion
7.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Special Duty Master →] (/masters/performance-discipline-masters/special-duty)'

💡 **Pro Tips:**
- Duty Name is mandatory
- Code should be unique
- End Date must be after Start Date
- Toggle switches for fees, reimbursement, and status
- Used for special duty assignments and tracking`,
   },

   increment_exam_master: {
      keywords: [
         'increment exam',
         'exam master',
         'add exam',
         'create exam',
         'new exam',
         'increment exam master',
         'exam management',
         'create exam master',
         'update exam master',
         'delete exam master',
      ],
      response: `📝 **Increment Exam Master - Quick Guide:**

1. Go to Masters → Performance & Discipline Masters → Increment Exam Master
2. Click Add New Increment Exam
3. Enter Exam Name 
4. Enter Exam Code 
5. Select Is Mandatory 
6. Select Is Technical 
7. Select Is Professional 
8. Select Is Promotional 
9. Select Record Valid 
10. Toggle Status 
11. Click Create Exam

Edit an Increment Exam:

1.Navigate to Masters → Performance & Discipline Masters → Increment Exam Master
2.Locate the exam in the list
3.Click the Edit button for that exam
4.The exam details will load in the edit form

Delete an Increment Exam:

1.Navigate to Masters → Performance & Discipline Masters → Increment Exam Master
2.Locate the exam in the list
3.Click the Delete button for that exam
4."Delete Increment Exam?"
5."Are you sure you want to delete "[Exam Name]"? This action cannot be undone."
6.Click Yes, delete! to confirm deletion.
7.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Increment Exam Master →](/masters/performance-discipline-masters/increment-exam-master)'
💡 **Pro Tips:**
- Exam Name is mandatory
- Code should be unique
- Radio buttons for Yes/No options
- Used for increment and promotion eligibility
- Inactive exams won't appear in dropdowns`,
   },

   significant_work_master: {
      keywords: [
         'significant work',
         'significant work master',
         'add significant work',
         'create significant work',
         'new significant work',
         'work management',
         'work type',
      ],
      response: `📋 **Significant Work Master - Quick Guide:**

1. Go to Masters → Performance & Discipline Masters → Significant Work Master
2. Click "Add New Significant Work"
3. Enter Work Name (Mandatory)
4. Enter Work Code 
5. Toggle Has Fees 
6. Toggle Is Reimbursable 
7. Toggle Status 
8. Click Create Work

Edit a Significant Work:

1.Navigate to Masters → Performance & Discipline Masters → Significant Work Master
2.Locate the work in the list
3.Click the Edit button for that work
4.The work details will load in the edit form

Delete a Significant Work:

1.Navigate to Masters → Performance & Discipline Masters → Significant Work Master
2.Locate the work in the list
3.Click the Delete button for that work
4."Delete Significant Work?"
5."Are you sure you want to delete "[Work Name]"? This action cannot be undone."
6.Click Yes, delete! to confirm deletion
7.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Significant Work Master →](/masters/performance-discipline-masters/significant-work-master)'
💡 **Pro Tips:**
- Work Name is mandatory
- Code should be unique
- Toggle switches for fees, reimbursement, and status
- Used for performance and discipline tracking`,
   },

   //leave-time-master

   leave_type_master: {
      keywords: [
         'leave type',
         'leave type master',
         'add leave type',
         'create leave type',
         'new leave type',
         'leave management',
         'casual leave',
         'earned leave',
         'sick leave',
         'annual leave',
      ],
      response: `📋 **Leave Type Master - Quick Guide:**

1. Go to Masters → Leave & Time Master → Leave Type
2. Click "Add New Leave Type"
3. Enter Leave Name
4. Enter Leave Code 
5. Enter Max Days Per Year 
6. Select Allowed Gender
7. Enter Min Days Before Application 
8. Enter Min Days Per Application 
9. Enter Max Days Per Application 
10. Select Accrual Policy 
11. Enter Accrual Days 
12. Select Carry Forward Allowed 
13. Enter Max Carry Forward Days 
14. Select Encashment Allowed 
15. Select Half Day Allowed 
16. Select Paid Status 
17. Select Status 
18. Click Create Leave Type

Edit a Leave Type:

1.Navigate to Masters → Leave & Time Master → Leave Type Master
2.Locate the leave type in the list
3.Click the Edit button for that leave type
4.The leave type details will load in the edit form

Delete a Leave Type:

1.Navigate to Masters → Leave & Time Master → Leave Type Master
2.Locate the leave type in the list
3.Click the Delete button for that leave type
4."Delete Leave Type?"
5."Are you sure you want to delete "[Leave Name]"? This action cannot be undone."
6.Click Yes, delete! to confirm deletion
7.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Leave Type Master →](/masters/leave-time-master/leave-type)'
💡 **Pro Tips:**
- Leave Name is mandatory
- Accrual Policy is mandatory
- Max Days between 0-365
- Min Days must be less than Max Days per application
- Used for employee leave management`,
   },

   shift_master: {
      keywords: [
         'shift master',
         'add shift',
         'create shift',
         'new shift',
         'shift schedule',
         'work shift',
         'shift management',
         'regular shift',
         'create shift',
         'update shift master',
         'delete shift master',
      ],
      response: `🕐 **Shift Master - Quick Guide:**

1. Go to Masters → Leave & Time Master → Shift Master
2. Click Add New Shift

# Basic Information:
3. Enter Shift Name 
4. Enter Shift Code 
5. Select Shift Type
6. Select Week Off *(Monday-Sunday)*
7. Select Start Time 
8. Select End Time 
9. Total Hours*(Auto-calculated)*
10. Select Midnight Shift
11. Enter Half Day Hours 
12. Enter Rotation Days
13. Select Break Start Time 
14. Select Break End Time 

Grace & Late Marking (Minutes):

15. Enter Grace In 
16. Enter Grace Out 
17. Enter Late Mark After
18. Enter Early Mark Before 

Overtime Settings:

19. Select OT Allowed *(Yes/No)*
20. Enter OT Grace (min)
21. Enter OT Rounding (min)
22. Enter Max OT Hours 

Flexible Timing:

23. Enter Flex In Start Time 
24. Enter Flex In End Time
25. Enter Flex Out Start Time 
26. Enter Flex Out End Time 

Holiday & Night Allowance:

27. Select Holiday Duty 
28. Select Night Allowance 
29. Click Create Shift

Edit a Shift:

1.Navigate to Masters → Leave & Time Master → Shift Master
2.Locate the shift in the list
3.Click the Edit button for that shift
4.The shift details will load in the edit form

Delete a Shift:

1.Navigate to Masters → Leave & Time Master → Shift Master
2.Locate the shift in the list
3.Click the Delete button for that shift
4."Delete Shift?"
5."Are you sure you want to delete this shift?"
6.Click Yes, delete! to confirm deletion
7.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Shift Master →](/masters/leave-time-master/shiftmaster)'

💡 **Pro Tips:**
- Name and Code are mandatory
- Start and End times are mandatory
- Total Hours auto-calculated
- Midnight shift for overnight work
- OT settings for overtime calculation
- Used for employee attendance and scheduling`,
   },

   holiday_master: {
      keywords: [
         'holiday',
         'holiday master',
         'add holiday',
         'create holiday',
         'new holiday',
         'holiday management',
         'public holiday',
         'national holiday',
         'bank holiday',
         'regional holiday',
         'restricted holiday',
      ],
      response: `📅 **Holiday Master - Quick Guide:**

1. Go to Masters → Leave & Time Master → Holiday Master
2. Click Add New Holiday

# Basic Information:
3. Enter Holiday Name 
4. Enter Holiday Code 
5. Enter Year 
6. Select Holiday Date
7. Select Holiday Type
8. Select Holiday Category 
9. Select Paid Holiday 
10. Select Optional Holiday
11. Select Compensatory
12. Select Attendance Impact
13. Select Pay Impact
14. Select OT Allowed
15. Select Status
16. Enter Remarks
17. Click Create Holiday

Edit a Holiday:
1.Navigate to Masters → Leave & Time Master → Holiday Master
2.Locate the holiday in the list
3.Click the Edit button for that holiday
4.The holiday details will load in the edit form

Delete a Holiday:

1.Navigate to Masters → Leave & Time Master → Holiday Master
2.Locate the holiday in the list
3.Click the Delete button for that holiday
4.Confirmation dialog appears:
   - "Delete Holiday?"
   - "Are you sure you want to delete "[Holiday Name]"? This action cannot be undone."
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion

🔗 **Click here to go:** '[Go to Holiday Master →](/masters/leave-time-master/holidaymaster)'

💡 **Pro Tips:**
- Name, Year, Date, Type, Category are mandatory
- Date auto-suggests based on selected year
- Code auto-suggestions from name
- Used for attendance and payroll processing`,
   },

   weekoff_pattern_master: {
      keywords: [
         'week off',
         'weekoff pattern',
         'woff pattern',
         'weekoff master',
         'add weekoff',
         'create weekoff',
         'new weekoff pattern',
         'rotational weekoff',
         'weekly off',
         'day off pattern',
      ],
      response: `📋 **Week Off Pattern Master - Quick Guide:**

1. Go to Masters → Leave & Time Master → Woff Master
2. Click Add New Woff Pattern
3. Enter Weekoff Name
4. Enter Weekoff Code
   - Example: WP001, ROT001, FIX001
5. Select Status
6. Click on day buttons to toggle OFF/ON:
   - Green OFF = Day Off (Weekend)
   - Gray ON = Working Day
7. Use bulk actions:
   - Clear All- Set all days to Working
   - Set All as Off - Set all days as Off
8. Pattern shows 6 weeks (42 days):
   - Week 1-6 with Monday-Sunday
   - Each button toggles individually
9. Click Create Woff Pattern

Edit a Woff Pattern:

1.Navigate to Masters → Leave & Time Master → Woff Pattern Master
2.Locate the woff pattern in the list
3.Click the Edit button  for that pattern
4.The pattern details will load in the edit form

Delete a Woff Pattern:

1.Navigate to Masters → Leave & Time Master → Woff Pattern Master
2.Locate the woff pattern in the list
3.Click the Delete button for that pattern
4.Confirmation dialog appears:
   - "Delete Woff Pattern?"
   - "Are you sure you want to delete "[Pattern Name]"? This action cannot be undone."
5.Click Yes, delete! to confirm deletion
6.Click Cancel to abort the deletion


🔗 **Click here to go:** '[Go to week off Master →](/masters/leave-time-master/woff-master)'

💡 **Pro Tips:**
- Name is mandatory
- 6-week pattern for rotational shifts
- Toggle individual days or use bulk actions
- Used for employee shift scheduling
- Inactive patterns won't appear in dropdowns`,
   },

   //masters/hall-shop-management/

   Shop_Category_master: {
      keywords: [
         'shop category master',
         'add shop category master',
         'delete shop category master',
         'edit shop catgeory master',
         'view shop category master',
      ],
      response: ` *Shop Category Master - Quick Guide:**
   
   1.Go to Masters menu -> hall-shop-management -> shop-categories
   2.Enter Category Name
     - Example: "Retail Shop", "Food Court", "Clothing Store"
   3.Enter Category Code
   4.Review all entered details
   5.Click Create Shop Category to save
   6.Click Cancel to discard changes

Edit Shop Category:

1.Navigate to Masters → Hall & Shop Management → Shop Categories
2.Find the shop category in the list
3.Click the Edit button 
4.Update the required fields:
   - Category Name
   - Category Code
5.Click Update Shop Category
6.Click Confirm to save changes

Delete Shop Category:

1.Navigate to Masters → Hall & Shop Management → Shop Categories
2.Find the shop category in the list
3.Click the Delete button 
4.Confirmation dialog appears:
   - Delete Shop Category? title
   - Shows category name being deleted
   - Are you sure you want to delete "Category Name"? This action cannot be undone.
6.Click Yes, delete! to confirm
7.Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Shop Category Master →] (/masters/hall-shop-management/shop-categories)'
💡 Pro Tips:
-Category Name is mandatory and must be unique
-Code is optional but helps in identification
-Inactive categories won't appear in dropdowns
-Used for shop classification and reporting
-Cannot delete if shops are assigned`,
   },

   shop_master: {
      keywords: [
         'shop master',
         'create shop master',
         'edit shop master',
         'view shop master',
         'delete shop master',
         'view shop master',
      ],
      response: ` *Shop Master - Quick Guide:**
  
  1.Go to Masters menu -> -> hall-shop-management -> shop masters
  2.Enter Shop Name 
   - Example: "City Mall Shop 101", "ABC Electronics"
  3.Enter Shop Code
   - Example: "SHOP-001", "MALL-A-101"
  4.Select Category
   - Searchable dropdown from Shop Category Master
  5. Enter Building Name
  6. Enter Floor
  7. Enter Block
  8. Enter Unit
  9. Enter Sq ft.
  10. Enter Sq Mt.
  11. Enter Facilities
  12. Upload Documents
  13. Set Status:
   - Active - Shop is available
   - Inactive - Shop is disabled
 14.Click Create Shop to save
 15.Click Cancel to discard changes
  
Edit Shop:

1.Navigate to Masters → Hall & Shop Management → Shop Master
2.Find the shop in the list
3.Click the Edit button 
4.Update the required fields:
   - Shop Name
   - Shop Code
   - Category
   - Location Details
   - Area Details
   - Facilities
   - Documents
   - Status

5.Click Update Shop
6.Click Confirm to save changes

Delete Shop:

1.Navigate to Masters → Hall & Shop Management → Shop Master
2.Find the shop in the list
3.Click the Delete button
4.Confirmation dialog appears:
   - Delete Shop? title
   - Shows shop name being deleted
   - Are you sure you want to delete "Shop Name"? This action cannot be undone.
5.Click Yes, delete! to confirm
6.Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Shop Master →](/masters/hall-shop-management/shop-master)'`,
   },

   shop_rental: {
      keywords: [
         'shop rental',
         'create shop rental',
         'edit shop rental',
         'view shop rental',
         'delete shop rental',
      ],
      response: ` *Shop Rental - Quick Guide:**
    
   1.Go to Masters menu -> Click on Hall & Shop Management -> Select Shop Rental -> Add Shop Rental button
   2.Select Shop 
      - Shows shop name and code
   3.Select Rental Date
   4.Enter Base Rent
   5.Enter Security Deposit
   6.Enter Tax Percentage
   7.Enter Late Fee
   8.Select Due Date
   9.Set Status
   10.Click Create Shop Rental to save
   11.Click Cancel to discard changes
   
Edit Shop Rental:

1.Navigate to Masters → Hall & Shop Management → Shop Rental
2.Find the rental in the list
3.Click the Edit button 
4.Update the required fields:
   - Shop
   - Rental Date
   - Base Rent
   - Security Deposit
   - Tax Percentage
   - Late Fee
   - Due Date
   - Status
5.Click Update Shop Rental
6.Click Confirm to save changes
    
delete shop rental

1.Navigate to Masters → Hall & Shop Management → Shop Rental
2.Find the rental in the list
3.Click the Delete button 
4.Confirmation dialog appears:
   - Delete Shop Rental? title
   - Shows shop name being deleted
   - Are you sure you want to delete this rental record for "Shop Name"? This action cannot be undone.
5.Click Yes, delete! to confirm
6.Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Shop Rental →](/masters/hall-shop-management/shop-rental)'`,
   },

   //transactions

   budget_initial_entry: {
      keywords: [
         'budget entry',
         'budget initial entry',
         'add budget entry',
         'create budget entry',
         'new budget entry',
         'budget allocation',
         'budget management',
      ],
      response: `💰 **Budget Initial Entry - Quick Guide:**

1. Go to Transactions → Budget Management → Budget Initial Entry
2. Click Add New Budget Entry

# Financial Details:
3. Select Financial Year 
   - Auto-selects current year
   - Only years with **Budget Open** status are available
4. Select Department 
5. Select Budget Head 
6. Enter Amount 
   
# Status Management *(Edit Mode Only)*:
7. Update Status
8. Upload supporting documents (Max 10 files, 10MB each)
9. Click Create Budget Entry

Edit Budget Entry:

1. Find the budget entry in the list
2. Click the Edit button 
3. Update the required fields:
    - Department (Optional - if not locked)
    - Budget Head (Optional - if not locked)
    - Amount (Mandatory)
    - Suggested Amount (Optional)
    - Upload Documents (Optional)
4. Click Update Budget Entry
5. Click Confirm to save changes

Delete Budget Entry:

1. Find the budget entry in the list
2. Click the Delete button 
3. Confirmation dialog appears:
    - "Delete Budget Entry?" title
    - Shows entry ID being deleted
    - "Are you sure you want to delete this budget entry?"
4. Click Yes, delete it! to confirm
5. Click Cancel to abort deletion


🔗 **Click here to go:** '[Go to Budget Initial Entry →](/transactions/budget-management/budgetinitialentry)'

💡 **Pro Tips:**
- Financial Year, Department, Budget Head, Amount are mandatory
- Budget Head depends on selected department
- Justification status requires at least 1 document
- Amount must be greater than 0
- Only budget-open years are available

`,
   },

   budget_revised_entry_view: {
      keywords: [
         'budget revised entry',
         'view budget revision',
         'budget revision details',
         'revised budget view',
         'budget entry view',
         'budget management',
         'budget revision',
      ],
      response: `📊 **Budget Revised Entry View - Quick Guide:**

1. Go to Transactions → Budget Management → Budget Revised Entry
2. Click on any row or  View button

Edit/Revise Entry:

3. Find the revised entry in the list
4. Click the Edit button 
5. Update the required fields:
    - Department (if allowed)
    - Budget Head (if allowed)
    - Amount (Mandatory)
    - Suggested Amount (Mandatory for revision)
    - Upload Documents (Optional)
6. Click Update Budget Entry
7. Click Confirm to save changes

🔗 **Click here to go:** '[Go to Budget Revised Entry  →](/transactions/budget-management/budgetrevisedentry)'

💡 **Pro Tips:**
- Rejected entries cannot be edited
- Justification status shows attached documents
- Audit logs show status change history
- Difference shows increase/decrease in amount
- Click revise to update suggested amount`,
   },

   budget_justification_uploads: {
      keywords: [
         'budget justification',
         'justification uploads',
         'budget documents',
         'upload justification',
         'budget justification list',
         'budget management',
         'justification files',
      ],
      response: `📎 **Budget Justification Uploads - Quick Guide:**

1. Go to Transactions → Budget Management → Budget Justification Uploads
2. View all entries with Justification status

# Dashboard Overview:
3. Statistics Cards:
   - Total Justification Entries - Count of J status entries
   
# Year Selection:
4. Select Financial Year from dropdown
5. Search by Department or Budget Head
6. View - See full entry details and documents
7. Edit - Update justification documents
8. Refresh - Reload the list

Edit Documents:

9. Find the entry in the list
10. Click the Edit button  button
11. Update the required fields:
    - Upload new documents
    - Remove existing documents
    - Update document descriptions
12. Click Update Budget Entry
13. Click Confirm to save changes


🔗 **Click here to go:** '[Go to Budget Justification Upload →] (/transactions/budget-management/budgetjustificationuploads)'
💡 **Pro Tips:**
- Only entries with **Justification (J)** status appear
- Documents count shows attached files
- Click **View** to see document details
- Click **Edit** to add/remove documents
- Search by department or budget head`,
   },

   budget_approvals_entry: {
      keywords: [
         'budget approvals',
         'approve budget',
         'budget approval entry',
         'approval management',
         'budget review',
         'budget management',
         'approve entries',
         'budget approval list',
      ],
      response: `✅ **Budget Approvals Entry - Quick Guide:**

1. Go to Transactions → Budget Management → Budget Approvals Entry
2. View all budget entries pending approval

3. Status Cards - Quick filter by status:
   - Draft  - Pending review
   - Revised  - Updated entries
   - Justification - With supporting docs
   - Approval - Ready for approval
   - Reject - Returned entries

4. Select Financial Year from dropdown
5. Search by Department or Budget Head
6. View - See full entry details
7. Edit - Approve or modify entry
8. Refresh - Reload the list

🔗 **Click here to go:** '[Go to Budget Approvals Entry →](/transactions/budget-management/budgetapprovalsentry)'

💡 **Pro Tips:**
- Click on any row to view details
- **Rejected** entries cannot be edited
- Status cards show counts per status
- Search across department and budget head
- Only entries with suggested amounts appear`,
   },

   budget_freeze_view: {
      keywords: [
         'budget freeze',
         'freeze budget',
         'budget freeze view',
         'view budget freeze',
         'budget freeze details',
         'budget management',
         'freeze entry',
      ],
      response: ` **Budget Freeze View - Quick Guide:**

1. Go to Transactions → Budget Management → Budget Freeze
2. Click on any row or  View button
🔗 **Click here to go:** '[Go to budget freeze view →](/transactions/budget-management/budgetfreeze)'

💡 **Pro Tips:**
- Frozen entries cannot be modified
- Only approved entries can be frozen
- Print report for official records
- Audit logs show status changes
- Copy details for sharing

`,
   },

   //transactions/grant-management

   grant_entry: {
      keywords: [
         'grant entry',
         'grant receipt',
         'add grant entry',
         'create grant entry',
         'new grant entry',
         'grant management',
         'grant receipt entry',
         'grant transaction',
      ],
      response: `📋 **Grant Entry - Quick Guide:**

1. Go to Transactions → Grant Management → Grant Entry
2. Click New Grant Entry
3. Select Financial Year 
4. Select Branch 
5. Select Grant Type 
6. Select Budget Head 
7. Enter Amount 
8. Select Date 
9. Enter Description 
10. Click Create Grant Entry

Edit Grant Entry:

11. Find the grant entry in the list
12. Click the Edit button
13. Update the required fields:
    - Branch/Department (Optional)
    - Grant Type (Optional)
    - Budget Head (Optional)
    - Amount (Mandatory)
    - Date (Mandatory)
    - Description (Optional)
14. Click Update Grant Entry
15. Click Confirm to save changes

Edit Grant Entry:

1. Find the grant entry in the list
2. Click the Edit button 
3. Update the required fields:
    - Branch/Department (Optional)
    - Grant Type (Optional)
    - Budget Head (Optional)
    - Amount (Mandatory)
    - Date (Mandatory)
    - Description (Optional)
4. Click Update Grant Entry
5. Click Confirm to save changes

🔗 **Click here to go:** '[Go to Grant Entry →] (/transactions/grant-management/grant-entry)'
💡 **Pro Tips:**
- Permission-based access control
- Status shows current workflow stage
- Click row to view details
- Only authorized users can edit/delete`,
   },

   //transactions/tender-management

   tender_entry_view: {
      keywords: [
         'tender entry',
         'view tender',
         'tender details',
         'tender entry view',
         'tender management',
         'tender information',
         'view tender',
         'add tender',
         'update tender',
         'delete tender',
      ],
      response: `📄 **Tender Entry View - Quick Guide:**

1. Go to Transactions → Tender Management → Tender Entry
2. Click on any row or View button

Tender Information:
- Tender Date - Date of tender entry
- Start Date - Tender start date
- End Date - Tender end date
- Tender Work - Tender type name with code
- Branch - Department name
- Budget Head - Budget head name
- Ledger Account - Ledger name with code

Financial Details:
- Proposal Amount - Proposed amount
- Approved Amount - Approved amount (if any)
- BG Percentage - Bank Guarantee percentage
- EMD Percentage - Earnest Money Deposit percentage
- Tender Fee - Tender fee amount

Edit Tender Entry:

3. Find the tender entry in the list
4. Click the Edit button
5. Update the required fields:
    - Tender Date (Mandatory)
    - Start Date (Mandatory)
    - End Date (Mandatory)
    - Tender Work (Mandatory)
    - Branch (Mandatory)
    - Budget Head (Mandatory)
    - Ledger Account (Mandatory)
    - Proposal Amount (Mandatory)
    - Approved Amount (Optional)
    - BG Percentage (Optional)
    - EMD Percentage (Optional)
    - Tender Fee (Optional)
    - Description (Optional)
    - Reference Documents (Optional)
6. Click Update Tender Entry
7. Click Confirm to save changes

Delete Tender Entry:

1. Find the tender entry in the list
2. Click the Delete button 
3. Confirmation dialog appears:
    - "Delete Tender Entry?" title
    - Shows entry ID being deleted
    - "Are you sure you want to delete this tender entry? This action cannot be undone."
4. Click Yes, delete! to confirm
5. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Tender Entry →](/transactions/tender-management/tenderentry)'

💡 **Pro Tips:**
- Click row to view details from list
- All dates displayed in Indian format
- Currency in INR format
- Documents with descriptions shown
- Print report for official records`,
   },

   work_allocation_view: {
      keywords: [
         'work allocation',
         'view work allocation',
         'allocation details',
         'work allocation view',
         'tender allocation',
         'vendor allocation',
         'allocation management',
      ],
      response: `📋 **Work Allocation View - Quick Guide:**

1. Go to Transactions menu
2. Click on Tender Management and select Work Allocation
3. Click on Extend Allocate Work
4. Fill in work allocation details:

Allocation Information:
   - Extend Order Date (Mandatory - Date picker)
   - Branch (Mandatory - Searchable dropdown)
   - Ledger Account (Mandatory - Searchable dropdown)
   - Tender (Mandatory - Searchable dropdown)
   - Vendor (Mandatory - Searchable dropdown)
   - Gross Amount (Mandatory - Numeric)
   - Reference ID (Mandatory)

 Documents (Optional):
   - Click Add More to add document rows
   - Select files (multiple per row)
   - Enter Description for each row
5. Click Create Allocation
6. The new allocation will appear in the list
7. Click Confirm to finalize

Edit Work Allocation:

1. Find the work allocation in the list
2. Click the Edit button 
3. Update the required fields:
    - Extend Order Date (Mandatory)
    - Branch (Mandatory)
    - Ledger Account (Mandatory)
    - Tender (Mandatory)
    - Vendor (Mandatory)
    - Gross Amount (Mandatory)
    - Reference ID (Mandatory)
    - Documents (Optional)
4. Click Update Allocation
5. Click Confirm to save changes

Delete Work Allocation:

1. Find the work allocation in the list
2. Click the Delete button 
3. Confirmation dialog appears:
    - "Delete Work Allocation?" title
    - Shows allocation ID being deleted
    - "Are you sure you want to delete work allocation #{id}? This action cannot be undone."
4. Click Yes, delete! to confirm
5. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Work Allocation View →](/transactions/tender-management/workallocation)'

💡 **Pro Tips:**
- Allocation percentage shown vs proposal/approved
- Progress bar visualizes allocation
- Documents clickable for viewing
- Financial summary in right panel`,
   },

   tender_penalty: {
      keywords: [
         'tender penalty',
         'tender adjustment',
         'add penalty',
         'create penalty',
         'new tender penalty',
         'penalty adjustment',
         'tender management',
         'adjustment amount',
         'percentage penalty',
         'fixed penalty',
      ],
      response: `⚠️ **Tender Penalty - Quick Guide:**

1. Go to Transactions → Tender Management → Tender Penalty
2. Click Add New Tender Adjustment
3. Select Date 
4. Select Sub-Ledger 
5. Select Ledger 
6. Select Tender Allocation 
7. Enter Penalty Type
   
# Calculation & Adjustment:
8. Select Calculation Type 
9. Select Adjustment Type 
10. If Percentage:
    - Enter Percentage
    - Adjustment Amount auto-calculated
11. If Fixed Amount:
    - Enter Adjustment Amount directly
12. Click Create Tender Adjustment

Edit Tender Adjustment:

1. Find the adjustment in the list
2. Click the Edit button 
3. Update the required fields:
    - Date (Mandatory)
    - Sub-Ledger (Mandatory)
    - Ledger (Mandatory)
    - Tender Allocation (Mandatory)
    - Penalty Type (Mandatory)
    - Calculation Type (Mandatory)
    - Percentage (if applicable)
    - Adjustment Amount (if fixed)
    - Adjustment Type (Mandatory)
4. Click Update Tender Adjustment
5. Click Confirm to save changes

Delete Tender Adjustment:

1. Find the adjustment in the list
2. Click the Delete button 
3. Confirmation dialog appears:
    - "Delete Tender Adjustment?" title
    - Shows bill number being deleted
    - "Are you sure you want to delete adjustment "Bill_No"? This action cannot be undone."
4. Click Yes, delete! to confirm
5. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Tender Penalty →](/transactions/tender-management/tenderpenalty)'

💡 **Pro Tips:**
- Sub-ledger, Ledger, Allocation, Date, Adjustment Type required
- Work Order Amount auto-filled from allocation
- Percentage auto-calculates adjustment amount
- Percentage must be between 0-100
- Keyboard navigation for all dropdowns`,
   },

   tender_emd_bg_receipt_entry: {
      keywords: [
         'tender emd',
         'tender bg',
         'emd receipt',
         'bg receipt',
         'tender emd bg receipt',
         'add tender emd',
         'create tender bg',
         'tender management',
      ],
      response: `📋 **Tender EMD/BG Receipt Entry - Quick Guide:**

1. Go to Transactions → Tender Management → Tender EMD/BG Receipt Entry
2. Click Add New Entry
3. Select Tender Date 
4. Select Party 
5. Select Start Date 
6. Select End Date 
7. Select Tender 
8. Enter EMD Amount (₹) 
9. Toggle Forward To Account (Yes/No)
   - **YES** - Entry for account
   - **NO** - Entry not for account
10. Click Create Entry

Edit Tender EMD/BG Receipt:

1. Find the EMD/BG entry in the list
2. Click the Edit button 
3. Update the required fields:
    - Tender Date (Mandatory)
    - Party (Mandatory)
    - Start Date (Mandatory)
    - End Date (Mandatory)
    - Tender (Mandatory)
    - EMD Amount (Mandatory)
    - Forward To Account (Yes/No)
4. Click Update Entry
5. Click Confirm to save changes

🔗 **Click here to go:** '[Go to Tender EMD/BG receipt Entry →] (/transactions/tender-management/tender-emd-bg-receipt-entry)'

💡 **Pro Tips:**
- Tender Date, Party, Start Date, End Date, EMD Amount are mandatory
- Tender selection shows full preview
- Forward To Account toggle for accounting
- Searchable dropdowns with keyboard navigation`,
   },

   work_bg_receipt_entry_view: {
      keywords: [
         'work bg receipt',
         'bg receipt view',
         'view bg receipt',
         'bank guarantee receipt',
         'bg entry details',
         'work bg view',
         'tender bg',
         'bg receipt entry',
      ],
      response: `📋 **Work BG Receipt Entry View - Quick Guide:**

1. Go to Transactions menu
2. Click on Tender Management and select Work BG Receipt Entry
3. Click on Add New Entry
4. Fill in the details:

**Basic Information:**
   - Date (Mandatory - Date picker)
   - BG Type (Mandatory - Dropdown)
     - Receipt
     - Release
     - Adjust
     - Forefeight
   - Bill Number (Mandatory)
   - BG Amount (Mandatory - Numeric)
   - Type (Optional)
   - Remarks (Optional)
5. Click Create Entry
6. The new BG entry will appear in the list
7. Click Confirm to finalize

Edit BG Receipt Entry:

1. Find the BG entry in the list
2. Click the Edit button 
3. Update the required fields:
    - Date (Mandatory)
    - BG Type (Mandatory)
    - Bill Number (Mandatory)
    - BG Amount (Mandatory)
    - Type (Optional)
    - Remarks (Optional)
4. Click Update Entry
5. Click Confirm to save changes

Delete BG Receipt Entry:

1. Find the BG entry in the list
2. Click the Delete button
3. Confirmation dialog appears:
    - "Delete BG Entry?" title
    - Shows entry being deleted
    - "Are you sure you want to delete this BG entry? This action cannot be undone."
4. Click Yes, delete! to confirm
5. Click Cancel to abort deletion

💡 **Pro Tips:**
- Status badge shows current workflow stage
- Rejection reason shown in red box
- All amounts in INR currency
- Click copy icon to copy bill number
- Print report for official records`,
   },

   work_bg_hod_approval: {
      keywords: [
         'work bg approval',
         'bg hod approval',
         'hod approval',
         'bank guarantee approval',
         'approve bg',
         'reject bg',
         'bg receipt approval',
         'tender bg approval',
      ],
      response: `✅ **Work BG HOD Approval - Quick Guide:**

1. Go to Transactions → Tender Management → Work BG Approval Entry
2. Click on any row or  View button
3. Approve - Approve BG entry (Green button)
4. Reject - Reject with reason (Red button)
   - Enter reason in modal
   - Entry status changes to Rejected

💡 **Pro Tips:**
- Only Draft entries show action buttons
- Rejection requires reason
- Copy bill number with icon
- Already processed entries show status message
- Status badges for quick identification`,
   },

   tender_emd_release: {
      keywords: [
         'tender emd release',
         'emd release',
         'release emd',
         'tender emd',
         'emd refund',
         'tender management',
         'release earnest money',
      ],
      response: `💰 **Tender EMD Release - Quick Guide:**

1. Go to Transactions → Tender Management → Tender EMD Release
2. Click "New Tender EMD Release"
3. Select Release Date 
4. Select Tender 
5. Choose Allocation Type 
6. View list of parties with:
   - Party Name - Subledger name
7. Use bulk actions:
   - Select All - Select all visible parties
8. Click any row to select/unselect
9. Click Release EMD to confirm

🔗 **Click here to go:** '[Go to Tender EMD Release →](/transactions/tender-management/tender-emd-release)'

💡 **Pro Tips:**
- Tender selection required first
- Allocation type determines party list
- Search by party name or amount
- Bulk selection for efficiency
- Bank Guarantee check prevents errors`,
   },

   noc_entry_view: {
      keywords: [
         'noc entry',
         'view noc',
         'noc details',
         'no objection certificate',
         'noc view',
         'tender noc',
         'noc management',
         'work allocation noc',
      ],
      response: `📋 **NOC Entry View - Quick Guide:**

1. Go to Transactions → Tender Management → NOC Entry
2. Click on any row or  View button

Edit NOC Entry:

1. Find the NOC entry in the list
2. Click the Edit button
3. Update the required fields:
    - Date (Mandatory)
    - Remarks (Optional)
4. Click Update Entry
5. Click Confirm to save changes

Delete NOC Entry:

1. Find the NOC entry in the list
2. Click the Delete button 
3. Confirmation dialog appears:
    - "Delete NOC Entry?" title
    - Shows entry being deleted
    - "Are you sure you want to delete this NOC entry? This action cannot be undone."
4. Click Yes, delete! to confirm
5. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to NOC Entry View →](/transactions/tender-management/noc-entry)'
💡 **Pro Tips:**
- Status badge shows current workflow stage
- Rejection reason shown prominently
- All amounts in INR currency
- Print report for official records`,
   },

   tender_bg_release: {
      keywords: [
         'tender bg release',
         'bg release',
         'release bank guarantee',
         'tender bank guarantee',
         'bank guarantee release',
         'bg refund',
         'tender management',
         'release bg',
      ],
      response: `🏦 **Tender BG Release - Quick Guide:**

1. Go to Transactions → Tender Management → Tender BG Release
2. Click New Tender BG Release
3. Select Tender 
4. View list of BG entries with:
   - Sub Ledger Name - Vendor/Party name
5. Use bulk actions:
   - Select All - Select all visible entries
   - Select Visible - Select current filtered list
   - Deselect All - Clear all selections
6. Click any row to select/unselect
7. Click Release BG to confirm

🔗 **Click here to go:** '[Go to Tender BG Release →](/transactions/tender-management/tender-bg-release)'

💡 **Pro Tips:**
- Tender selection required first
- Search by vendor name or amount
- Bulk selection for efficiency
- NOC Approval check prevents errors
- Only Credit BG entries shown`,
   },

   action_work_order: {
      keywords: [
         'action work order',
         'work allocation',
         'allocate work',
         'extend allocate work',
         'work order',
         'tender work order',
         'vendor allocation',
         'tender management',
      ],
      response: `📋 **Action Work Order - Quick Guide:**

1. Go to Transactions → Tender Management → Action Work Order
2. Click Extend Allocate Work
3. Select Extend Order Date
4. Select Branch 
5. Select Ledger Account 
6. Select Tender 
7. Select Vendor 
8. Enter Gross Amount (₹)
9. Enter Reference ID
10. Click Add More to add document rows
11. Select files (multiple per row)
12. Enter Description for each row
13. Click Create Allocation

Edit Tender Work Type:

1. Find the work type in the list
2. Click Edit button
3. Update: Work Name, Status
4. Click Update Tender Work
5. Click Confirm to save

Delete Tender Work Type:

14. Find the work type in the list
15. Click Delete button
16. Confirm deletion

🔗 **Click here to go:** '[Go to Action Work Order →](/transactions/tender-management/action-work-order)'

💡 **Pro Tips:**
- Branch, Ledger, Tender, Vendor, Gross Amount are mandatory
- Documents are optional
- Multiple files per row supported
- Any gross amount allowed (no restriction)
- Searchable dropdowns with keyboard navigation

`,
   },
   //transactions/bookkeeping-vouchers

   receipt_voucher_entry: {
      keywords: [
         'receipt voucher',
         'create receipt voucher',
         'receipt entry',
         'voucher entry',
         'receipt voucher creation',
         'accounting voucher',
         'receipt transaction',
         'bookkeeping',
         'voucher management',
      ],
      response: `📋 **Receipt Voucher Entry - Quick Guide:**

1. Go to Transactions → Bookkeeping Vouchers → Receipt Entries
2. Click Create Receipt Voucher

3. Select Date 
4. First Line - Bank Account 
5. Additional Lines - Ledger Accounts
6. Enter Narration

Validation Rules:
- Bank Account must be first line with Debit only
- Each line can have only Debit OR Credit (not both)
- Total Debit = Total Credit
- Sub-ledger totals must match parent amount for S-mode
7. Click Save Receipt Voucher

🔗 **Click here to go:** '[Go to Receipt Voucher Entry →] (/transactions/bookkeeping-vouchers/receipt-entries)'

💡 **Pro Tips:**
- First line must be Bank Account with Debit
- Searchable dropdowns for fast ledger selection
- Sub-ledger support for S-mode accounts
- Real-time validation and totals
- Auto-generates voucher number`,
   },

   payment_voucher_entry: {
      keywords: [
         'payment voucher',
         'create payment voucher',
         'payment entry',
         'voucher entry',
         'payment voucher creation',
         'accounting voucher',
         'payment transaction',
      ],
      response: `📋 **Payment Voucher Entry - Quick Guide:**

1. Go to Transactions → Bookkeeping Vouchers → Payment Entries
2. Click Create Payment Voucher
3. Select Date 
4. First Line - Bank Account 
   - Select a Bank Account
5. Additional Lines - Ledger Accounts
   - Click the ledger field to open dropdown
   - Search by name, code, or English name
6. Enter Narration
   - Description of the payment transaction
7. Click Save Payment Voucher

🔗 **Click here to go:** '[Go to Payment Voucher Entry →](/transactions/bookkeeping-vouchers/payment)'

💡 **Pro Tips:**
- First line must be Bank Account with Credit
- Searchable dropdowns for fast ledger selection
- Sub-ledger support for S-mode accounts
- Real-time validation and totals
- Auto-generates voucher number`,
   },

   contra_voucher_list: {
      keywords: [
         'contra voucher',
         'contra entries',
         'contra voucher list',
         'view contra vouchers',
         'contra voucher management',
         'voucher list',
         'contra transaction',
      ],
      response: `📋 **Contra Voucher List - Quick Guide:**

1. Go to Transactions → Bookkeeping Vouchers → Contra Entries
2. View all contra vouchers in the list
3. Search by:
   - Voucher ID
   - Amount
   - Ledger name
4. Filter by Date :
   - From Date
   - To Date
5. Clear Filters - Reset all filters
6. Click Create Voucher to add new contra voucher

🔗 **Click here to go:** '[Go to Contra Voucher List →](/transactions/bookkeeping-vouchers/contra-entries)'

💡 **Pro Tips:**
- Search by Voucher ID for quick access
- Use date filters for period-wise reports
- Excel export with all filtered data
- Delete requires confirmation
- Click row actions for view/edit/delete`,
   },

   journal_voucher_list: {
      keywords: [
         'journal voucher',
         'journal entries',
         'journal voucher list',
         'view journal vouchers',
         'journal voucher management',
         'journal transaction',
      ],
      response: `📋 **Journal Voucher List - Quick Guide:**

1. Go to Transactions → Bookkeeping Vouchers → Journal Entries
2. View all journal vouchers in the list
3. Search by:
   - Voucher ID
   - Amount
   - Ledger name
4. Filter by Date:
   - From Date
   - To Date
5. Clear Filters - Reset all filters
6. Click Create Voucher to add new journal voucher

🔗 **Click here to go:** '[Go to Journal Entry →](/transactions/bookkeeping-vouchers/journal-entries)'

💡 **Pro Tips:**
- Search by Voucher ID for quick access
- Use date filters for period-wise reports
- Excel export with all filtered data
- Delete requires confirmation
- Click row actions for view/edit/delete

`,
   },
   opening_balance_voucher_view: {
      keywords: [
         'opening balance voucher',
         'opening voucher view',
         'view opening voucher',
         'opening balance details',
         'voucher view',
         'opening entry',
         'opening balance entry',
      ],
      response: `📋 **Opening Balance Voucher View - Quick Guide:**

1. Go to Transactions menu
2. Click on Bookkeeping Vouchers and select Journal Entries
3. Click Create Voucher
4. Fill in the details:

Voucher Information:
   - Date (Mandatory - Date picker)
   - Narration (Optional - Text area)
5. Click Save Journal Voucher
6. The new voucher will appear in the list
7. Click Confirm to finalize

Edit Journal Voucher:

1. Find the voucher in the list
2. Click the Edit button 
3. Update the required fields:
    - Date (Mandatory)
    - Narration (Optional)
    - Add/Remove/Update rows
    - For each row: Ledger, Sub-Ledger, Debit/Credit Amount
4. Click Update Journal Voucher
5. Click Confirm to save changes

🔗 Click here to go: '[Go to Opening Balance Voucher View →] (/transactions/bookkeeping-vouchers/opening-balance-entries)

💡 **Pro Tips:**
- Check balance status at a glance
- Sub-ledger entries shown indented
- Print report for official records
- Edit only if not locked`,
   },

   new_challan_update: {
      keywords: [
         'new challan update',
         'challan voucher',
         'income challan',
         'add challan',
         'create challan',
         'new challan',
         'challan management',
         'tax challan',
         'income voucher',
      ],
      response: `📋 **New Challan Update - Quick Guide:**

1. Go to Transactions → Bookkeeping Vouchers → New Challan Update
2. Click New Income Challan Voucher
3. Select Date 
4. Enter Challan No.(Auto-generated)
5. Select Branch 
6. Select Challan Type
7. Each row requires:
   - Ledger Account   - Searchable dropdown
   - Party Name  - Searchable (creates new if not found)
   - GST No. - Auto-looks up existing party
   - Amount (₹) 
   - Payment Mode  - Cash/Digital/Cheque
8. For Cheque/DD payment:
   - Bank Name, Cheque No., Cheque Date, Receipt Date
9. For Bank Transfer payment:
   - Bank Name, Account No., IFSC Code, Receipt Date
10. Click Add to save each row
11. Click Create Voucher to finalize

Edit Income Challan Voucher:

1. Find the voucher in the list
2. Click the Edit button 
3. Update the required fields:
    - Date (Mandatory)
    - Branch (Mandatory)
    - Challan Type (Mandatory)
    - Bill Details (Add/Remove/Update rows)
    - Payment Mode details
4. Click Update Voucher
5. Click Confirm to save changes

Delete Income Challan Voucher:

1. Find the voucher in the list
2. Click the Delete button 
3. Confirmation dialog appears:
    - "Delete Challan Voucher?" title
    - Shows voucher number being deleted
    - "Are you sure you want to delete voucher "CV_No"? This action cannot be undone."
4. Click Yes, delete! to confirm
5. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to New Challan Update →](/transactions/bookkeeping-vouchers/new-challan-update)'

💡 **Pro Tips:**
- Party search creates new party automatically
- GST lookup finds existing sub-ledgers
- Tax calculation auto-applies
- Import supports bulk entry
- Only completed rows are saved

`,
   },
   expense_challan_update: {
      keywords: [
         'expense challan',
         'expense bill',
         'bill voucher',
         'add expense challan',
         'create expense bill',
         'new expense challan',
         'expense management',
         'payment voucher',
         'expense entry',
      ],
      response: `📋 **Expense Challan Update - Quick Guide:**

1. Go to Transactions → Bookkeeping Vouchers → New Expense Challan Update
2. Click Expense Bill Voucher
3. Select Date 
4. Enter Bill No. (Auto-generated)
5. Select Branch 
6. Select Tender Type
7. Each row requires:
   - Ledger Account
   - Party Name
   - GST No.
   - Amount (₹)
   - Penalty Amount (₹)
   - Payment Mode- Cash/Bank/Cheque/DD/Online/Card
8. For Cheque/DD payment:
   - Bank Name, Cheque No., Cheque Date, Receipt Date
9. For Bank Transfer payment:
   - Bank Name, Account No., IFSC Code, Receipt Date
10. Click Add Row to add more entries
11. Click Create Voucher to finalize

Edit Expense Challan Voucher:

1. Find the voucher in the list
2. Click the Edit butto
3. Update the required fields:
    - Date (Mandatory)
    - Branch (Mandatory)
    - Tender Type (Mandatory)
    - Bill Details (Add/Remove/Update rows)
    - Payment Mode details
    - Penalty Amount (Optional)
4. Click Update Voucher
5. Click Confirm to save changes

Delete Expense Challan Voucher:

1. Find the voucher in the list
2. Click the Delete button 
3. Confirmation dialog appears:
    - "Delete Expense Challan Voucher?" title
    - Shows voucher number being deleted
    - "Are you sure you want to delete voucher "CV_No"? This action cannot be undone."
4. Click Yes, delete! to confirm
5. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to Expense Challan Update →'](/transactions/bookkeeping-vouchers/new-expense-challan-update)'

💡 **Pro Tips:**
- Penalty amount is deducted from net amount
- Tax calculation auto-applies based on tender type
- Manual tax entry available for custom formulas
- Import supports bulk entry with warnings
- Payment mode determines which fields appear

`,
   },
   new_challan_approval_list: {
      keywords: [
         'challan approval',
         'new challan approval',
         'approve challan',
         'challan voucher approval',
         'bulk approval',
         'approval list',
         'challan management',
         'voucher approval',
      ],
      response: `✅ **New Challan Approval List - Quick Guide:**

1. Go to Transactions → Bookkeeping Vouchers → New Challan Approval
2. View all pending challan vouchers for approval
3. Select vouchers using checkboxes
4. Click Approve Selected
5. For Final Stage vouchers:
   - Bank Account selection modal appears
   - Select bank accounts for Cash/Non-Cash payments
   - Enter narration (optional)
   - Process all vouchers at once


🔗 **Click here to go:** '[Go to new Challan Approval List →] (/transactions/bookkeeping-vouchers/new-challan-approval)'

### 💡 Pro Tips:
- Only vouchers you have permission to approve are selectable
- Final stage requires bank account selection
- Bulk approval processes financial entries
- Status filter shows only forward actions`,
   },

   // transactions/vendor-payments

   bill_challan_entry: {
      keywords: [
         'bill challan entry',
         'payment voucher',
         'vendor payment',
         'create bill challan',
         'bill entry',
         'challan entry',
         'vendor bill',
         'payment processing',
         'tax calculation',
         'bill management',
      ],
      response: `📋 **Bill Challan Entry - Quick Guide:**

1. Go to Transactions → Vendor Payments → Bill Challan Entry
2. Click Create Payment Voucher
3. Select Bill Date
4. Voucher Number
5. Select Branch
   - Searchable dropdown with hierarchical view
6. Select Ledger Account
7. Select Vendor
8. Select Tender Allocation
9. Enter Basic Amount (Bill Amount)
   - Must be ≤ Tender Allocation amount
10. Click Create Payment Voucher to save

🔗 **Click here to go:** '[Go to Bill Challan Entry →](/transactions/vendor-payments/bill-challan-entry)'

💡 **Pro Tips:**
- Branch → Ledger → Vendor → Tender → Amount (must follow this order)
- Amount cannot exceed tender allocation
- Tax calculation auto-applies
- Penalties auto-load
- Manual tax entry available for custom formulas`,
   },

   account_verification_list: {
      keywords: [
         'account verification',
         'payment voucher verification',
         'account approval',
         'verify payment',
         'account query',
         'voucher verification',
         'account approval list',
         'payment verification',
         'account department',
      ],
      response: `✅ **Account Verification List - Quick Guide:**

1. Go to Transactions → Vendor Payments → Account Verification
2. View HOD approved payment vouchers for account verification

🔗 **Click here to go:** '[Go to Account Verification List →](/transactions/vendor-payments/account-verification)'
💡 **Pro Tips:**
- Status filter shows different stages
- HOD Approved is the default filter
- Copy voucher number with click
- View details to take action
- Refresh to get latest updates`,
   },

   payment_execution_view: {
      keywords: [
         'payment execution',
         'process payment',
         'execute payment',
         'payment voucher execution',
         'payment processing',
         'vendor payment execution',
         'payment approval',
         'payment execution view',
      ],
      response: `💳 **Payment Execution View - Quick Guide:**

1. Go to Transactions → Vendor Payments → Payment Execution
2. Click on any row or View button
3. Select Bank Account (Mandatory)
4. Enter Description/Narration
5. Click Process Payment to execute

🔗 **Click here to go:** '[Go to Payment execution view →](/transactions/vendor-payments/account-verification)'

💡 **Pro Tips:**
- Bank Account selection required for processing
- Narration applies to both vouchers
- Click copy icon for voucher number
- Already processed payments show "Saved" badge
- Print report for official records`,
   },

   //transactions/attendance-management/attendance

   attendance_record_entry: {
      keywords: [
         'attendance record',
         'attendance entry',
         'attendance management',
         'view attendance',
         'add attendance',
         'monthly attendance',
         'attendance register',
         'employee attendance',
         'attendance report',
      ],
      response: `📋 **Attendance Record Entry - Quick Guide:**

1. Go to Transactions → Attendance Management → Attendance → Attendance Record Entry
2. View and manage monthly attendance records
3. Select Payroll Bill
4. Select Month 
5. Select Year 
6. Select Department
7. Select Designation
8. Select Employee
9. Enter Search Term
10. Click Generate Report to view attendance

Edit Attendance Record:

1. Find the attendance record in the list
2. Click the Edit button
3. Update the required fields:
    - Payroll Bill (Mandatory)
    - Month (Mandatory)
    - Year (Mandatory)
    - Department (Optional)
    - Designation (Optional)
    - Employee (Optional)
4. Click Update Attendance Record
5. Click Confirm to save changes

Delete Attendance Record:

1. Find the attendance record in the list
2. Click the Delete button 
3. Confirmation dialog appears:
    - "Delete Attendance Record?" title
    - Shows employee name being deleted
    - "Are you sure you want to delete attendance record for "Employee Name"?"
4. Click Yes, delete! to confirm
5. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to attendance record entry →] (/transactions/attendance-management/attendance/attendance-record-entry)'

💡 **Pro Tips:**
- Month and Year are mandatory fields
- Holiday and Week Off auto-calculated
- Hover on status for tooltip details
- Expand view for employee summary
- Export for reporting purposes`,
   },

   manual_attendance_entry_view: {
      keywords: [
         'manual attendance',
         'manual attendance view',
         'attendance request',
         'view attendance request',
         'manual attendance details',
         'attendance approval',
         'attendance management',
      ],
      response: `📋 **Manual Attendance Entry View - Quick Guide:**

1. Go to Transactions → Attendance Management → Attendance → Manual Attendance Entry
2. Click on any row or  View button

# Request Information:
- Employee - Name of the employee
- Department - Department name
- Status - Current approval status badge
- Requested On - Date of request
- Processed On - Date of processing (if any)
- Processed By - Approver name

# Attendance Details:
- Start Date - From date
- End Date - To date
- Total Days - Number of working days
- Holidays in Range - Holiday count
- Reason - Reason type (Biometric Failure, Forgot Punch, Field Duty, etc.)
- Place of Visit - Location (if applicable)
- Remarks - Detailed reason

3. Approve - Forward to next stage (Green button)
4. Raise Query - Return to previous stage (Red button)
   - Enter query details in modal
   - Request returns to previous stage

Edit Manual Attendance Request:

1. Find the request in the list
2. Click the Edit button 
3. Update the required fields:
    - Start Date (Mandatory)
    - End Date (Mandatory)
    - Reason (Mandatory)
    - Place of Visit (Conditional)
    - Remarks (Optional)
4. Click Update Request
5. Click Confirm to save changes

Delete Manual Attendance Request:

1. Find the request in the list
2. Click the Delete button 
3. Confirmation dialog appears:
    - "Delete Manual Attendance Request?" title
    - Shows request being deleted
    - "Are you sure you want to delete this request? This action cannot be undone."
4. Click Yes, delete! to confirm
5. Click Cancel to abort deletion
   
🔗 **Click here to go:** '[Go to manual attendance entry view →](/transactions/attendance-management/attendance/manual-attendance-entry)'

💡 **Pro Tips:**
- Status badge shows current workflow stage
- Query remarks shown in amber box
- Only authorized users see action buttons
- Print report for official records
- Already processed requests show "No Action Required"`,
   },

   manual_attendance_approval_view: {
      keywords: [
         'manual attendance approval',
         'attendance approval',
         'approve attendance',
         'manual attendance',
         'attendance request approval',
         'hod approval',
      ],
      response: `✅ **Manual Attendance Approval View - Quick Guide:**

1. Go to Transactions → Attendance Management → Attendance → Manual Attendance Approval
2. Click on any row or  View button
3. Approve - Forward to next stage (Green button)
4. Raise Query - Return to previous stage (Red button)
   
🔗 **Click here to go:** '[Go to Manual attendance approval view →](/transactions/attendance-management/attendance/manual-attendance-approval)'

💡 **Pro Tips:**
- Status badge shows current stage
- Query remarks shown in amber box
- Two-step jump may occur for backward actions
- Only authorized users see action buttons
- Already processed requests show "No Action Required"
- Your designation and department ID shown for context`,
   },

   overtime_record_entry: {
      keywords: [
         'overtime record',
         'overtime entry',
         'add overtime',
         'create overtime',
         'new overtime',
         'overtime management',
         'overtime hours',
         'attendance overtime',
         'overtime record entry',
      ],
      response: `⏱️ **Overtime Record Entry - Quick Guide:**

1. Go to Transactions → Attendance Management → Attendance → Overtime Record Entry
2. Click Add New Record
3. Select Overtime Date 
4. Select Employee 
5. Enter In Time 
6. Enter Out Time
7. Enter Reason
8. Click Create Record

Edit Overtime Record:

1. Find the overtime record in the list
2. Click the Edit button 
3. Update the required fields:
    - Overtime Date (Mandatory)
    - Employee (Mandatory)
    - In Time (Mandatory)
    - Out Time (Mandatory)
    - Reason (Optional)
4. Click Update Record
5. Click Confirm to save changes

Delete Overtime Record:

1. Find the overtime record in the list
2. Click the Delete button 
3. Confirmation dialog appears:
    - "Delete Overtime Record?" title
    - Shows record being deleted
    - "Are you sure you want to delete this overtime record? This action cannot be undone."
4. Click Yes, delete! to confirm
5. Click Cancel to abort deletion

🔗 **Click here to go:** '[Go to overtime record entry →] (/transactions/attendance-management/attendance/overtime-record-entry)' 

💡 **Pro Tips:**
- Overtime hours auto-calculated from In/Out times
- Early Coming detected: Before 10:00 AM
- Late Going detected: After 6:00 PM
- Previous/Subsequent holidays auto-detected
- Shift time: 10:00 AM to 6:00 PM`,
   },

   overtime_record_approval_view: {
      keywords: [
         'overtime record approval',
         'overtime approval',
         'approve overtime',
         'overtime record',
         'overtime request approval',
         'hod approval',
         'attendance management',
         'query overtime',
      ],
      response: `✅ **Overtime Record Approval View - Quick Guide:**

1. Go to Transactions → Attendance Management → Attendance → Overtime Record Approval
2. Click on any row or View button

# Request Information:
- Employee - Name of the employee
- Department - Department name
- Status - Current approval status badge
- Requested On - Date of request
- Processed On - Date of processing (if any)
- Processed By - Approver name

# Overtime Details:
- Overtime Date - Date of overtime
- In Time - Punch in time (Auto-detects Early Coming)
- Out Time - Punch out time (Auto-detects Late Going)
- Total Overtime Hours - Calculated hours
- Shift Status - Early Coming / Late Going badges
- Holidays - Previous/Subsequent holiday indicators
- Remarks - Reason for overtime

3. Approve - Forward to next stage (Green button)
4. Raise Query - Return to previous stage (Red button)

🔗 **Click here to go:** '[Go to overtime record approval view →](/transactions/attendance-management/attendance/overtime-record-entry)'

💡 **Pro Tips:**
- Status badge shows current workflow stage
- Query remarks shown in amber box
- Two-step jump may occur for backward actions
- Only authorized users see action buttons
- Already processed records show "No Action Required"
- Early Coming: Before 10:00 AM
- Late Going: After 6:00 PM
- Shift time: 10:00 AM to 6:00 PM

`,
   },

   payment_voucher_entry: {
      keywords: [
         'payment voucher',
         'create payment voucher',
         'payment entry',
         'voucher entry',
         'payment voucher creation',
         'accounting voucher',
         'payment transaction',
      ],
      response: `📋 **Payment Voucher Entry - Quick Guide:**

1. Go to Transactions → Bookkeeping Vouchers → Payment Entries
2. Click Create Payment Voucher
3. Select Date 
4. First Line - Bank Account 
5. Additional Lines - Ledger Accounts
6. Enter Narration
7. Click Save Payment Voucher

🔗 **Click here to go:** '[Go to attendance record entry →]()'

💡 **Pro Tips:**
- First line must be Bank Account with Credit
- Searchable dropdowns for fast ledger selection
- Sub-ledger support for S-mode accounts
- Real-time validation and totals
- Auto-generates voucher number`,
   },

   leave_application_entry: {
      keywords: [
         'leave application',
         'create leave application',
         'apply for leave',
         'leave entry',
         'leave request',
         'employee leave',
         'leave management',
         'paid leave',
         'unpaid leave',
         'leave balance',
      ],
      response: `📋 **Leave Application Entry - Quick Guide:**

1. Go to Transactions → Attendance Management → Leave → Leave Application Entry
2. Click Create New Application or select existing entry to edit

# Employee Selection:
3. Select Employee
   - Click dropdown to search employees
   
4. Select Leave Type 
   - Click dropdown to browse leave types
   - Search by leave type name
   
5. View Leave Balance
   - Total Credited - Days credited in financial year
   - Total Debited - Days already used
   
6. Select From Date
   - Choose start date from calendar picker
   - Auto-detects prefix holidays (previous day holiday)

7. Select To Date 
   - Choose end date from calendar picker
   - Auto-detects suffix holidays (next day holiday)

8. Half Day Options:
   - Full Day - Full day leave
   - First Half - Morning session only
   - Second Half - Afternoon session only
   - Applies to both From Date and To Date separately

9. Auto-calculated Fields:
   - Total Days - Calculated based on date range and half-day selections
   - Paid Days - Based on available balance (auto-calculated)
   - Unpaid Days - Days exceeding available balance (auto-calculated)

10. Leave Breakdown Display:
    - Shows Paid/Unpaid split
    
11. Reason
    - Enter reason for leave application
    
12. Contact Number
    - Phone number during leave period
    - For emergency contact

13. Leave Address
    - Address during leave period
    - Multiple lines supported

14. Click Create Application or Update Application

🔗 **Click here to go:** '[Go to Leave Application Entry →](/transactions/attendance-management/leave/leave-application-entry)'

💡 **Pro Tips:**
- Leave balance shows real-time data from server
- Paid/Unpaid calculation considers available balance
- Half-day selections automatically adjust total days
- Prefix/Suffix holidays auto-detected from holiday list
- All mandatory fields marked with *
- Status auto-set to initial workflow stage`,
   },

   leave_application_approval: {
      keywords: [
         'leave application approval',
         'approve leave',
         'leave approval',
         'leave application review',
         'approve leave request',
         'leave management',
         'leave workflow',
      ],
      response: `📋 **Leave Application Approval - Quick Guide:**

1. Go to Transactions → Attendance Management → Leave → Leave Application Approval
2. Select and view a Leave Application from the list

# Request Information:
3. Employee Details :-
   - Employee name and department
   - Current application status
   - Request date and time
   - Processing information (if any)

4. Leave Details
   - Leave Type (Casual, Earned, Sick, etc.)
   - Date Range (From Date → To Date)
   - Half-day information (Full Day/First Half/Second Half)
   - Total working days
   - Paid/Unpaid breakdown

🔗 **Click here to go:** '[Go to Leave Application Approval →](/transactions/attendance-management/leave/leave-application-entry)'

💡 **Pro Tips:**
- Final approval automatically creates leave transaction
- Leave balance updates immediately after final approval
- Query remarks are visible to the applicant
- Half-day options affect total days calculation`,
   },

   leave_credits_view: {
      keywords: [
         'leave transaction view',
         'leave credit details',
         'view leave transaction',
         'leave balance details',
         'transaction history',
         'leave credit information',
         'leave debit details',
      ],
      response: `📋 **Leave Transaction View - Quick Guide:**

1. Go to Transactions → Attendance Management → Leave → Leave Credits
2. Select and view a Leave Transaction from the list

3. Employee Details
   - Employee full name
   - Employee code
   - Department and Designation
   - Auto-populated from employee master

#Leave Type Details:
4. Leave Type Information
   - Leave type name (Casual, Earned, Sick, etc.)
  
5. Transaction Type
   - Accrual - Regular leave accrual
   - Opening Credit - Initial leave credit
   - Carry Forward - Previous year balance
   - Debit Applied - Leave consumed
   - Credit Cancelled - Cancelled credit
   
6. Transaction Mode
7. Transaction Days
   - Number of leave days affected
   
🔗 **Click here to go:** '[Go to Leave Credits →](/transactions/attendance-management/leave/leave-credits)' 

💡 **Pro Tips:**
- Credit transactions increase leave balance (green)
- Debit transactions decrease leave balance (red)
- Financial year determines annual leave limits
- Transaction dates are auto-recorded`,
   },

   leave_cancel_entry: {
      keywords: [
         'leave cancellation',
         'cancel leave application',
         'leave cancel entry',
         'bulk leave cancellation',
         'cancel pending leave',
         'leave cancellation entry',
         'leave cancel',
         'cancel leave request',
         'leave reversal',
      ],
      response: `📋 **Leave Cancel Entry - Quick Guide:**

1. Go to Transactions → Attendance Management → Leave → Leave Cancel Entry
2. This is a BULK CANCELLATION tool for pending leave applications

3. Select Filters (At least one required)
   - Financial Year - Select from dropdown
   - Leave Type - Select leave type
   - Employee - Search and select employee
   - All dropdowns support search functionality

4. Generate Pending Leaves
   - Click Generate button
   - System fetches all pending leave applications (Lv_Mode = "L")
   - Shows applications matching selected filters
   - Auto-filters to show only active leaves

5. Application List
   - Employee name and code
   - Leave type with color badge
   - Date range (From → To)
   - Total days
   - Status indicator

6. Click Back arrow to return to leave cancellation list

🔗 **Click here to go:** '[Go to Leave Cancel Entry →](/transactions/attendance-management/leave/leave-cancel-entry)'

💡 **Pro Tips:**
- Only pending leaves (Lv_Mode="L") can be cancelled
- Cancellation creates transaction record automatically
- Use filters to narrow down applications
- Bulk cancel saves time for multiple leaves`,
   },

   leave_carryforward_view: {
      keywords: [
         'leave carry forward view',
         'leave carry forward',
         'carry forward records',
         'leave balance transfer',
         'carry forward summary',
         'leave carry forward details',
         'financial year carry forward',
      ],
      response: `📋 **Leave Carry Forward View - Quick Guide:**

1. Go to Transactions → Attendance Management → Leave → Leave Carry Forward Entry
2. Select and view a Carry Forward Record from the list

Status Information:
3. Timeline Details
   - Processed Date & Time
   - Created At timestamp
4. From Financial Year
   - Source financial year
5. To Financial Year
   - Destination financial year
6. Total Carried Forward
   - Number of days carried forward
   
7. Click Back arrow to return to carry forward list

🔗 **Click here to go:** '[Go to Leave Carryforward View →](/transactions/attendance-management/leave/leave-carryforward-entry)'

💡 **Pro Tips:**
- Carry forward moves leave balance between financial years
- Lapsed leave cannot be recovered
- Auto carry follows system rules
- Manual carry allows custom selection
- Print for official documentation
- Export JSON for data analysis
- Section toggles for focused viewing
- Balance shows real-time availability
- Tracks both carried and lapsed leave`,
   },

   leave_encashment_view: {
      keywords: [
         'leave encashment view',
         'encashment details',
         'leave encashment',
         'view encashment',
         'leave payment',
         'encashment transaction',
         'leave encashment record',
         'leave encashment details',
      ],
      response: `📋 **Leave Encashment View - Quick Guide:**

1. Go to Transactions → Attendance Management → Leave → Leave Encashment
2. Select and view an **Encashment Record** from the list
3. Employee Details
   - Employee full name
   - Department and Designation
4. Leave Type Information
   - Leave type name
5. Transaction Type
   - Encashment - Standard encashment
6. Transaction Mode
7. Transaction Status
   - Approved - Encashment approved
   - Pending - Awaiting approval
   - Rejected - Encashment rejected
   - Processing - Being processed
   - Cancelled - Cancelled transaction
8. Encashment Days
   - Number of leave days encashed
9. Amount Details
   - Daily Rate - Rate per leave day
   - Total Amount - Total encashment amount
  
10. Click Print button

🔗 **Click here to go:** '[Go to Leave Encashment View →](/transactions/attendance-management/leave/leave-encashment)'

💡 **Pro Tips:**
- Encashment converts leave days to monetary value
- Status tracks approval workflow
- Payment reference for reconciliation
- Daily rate determined by policy
- Print for official records
- Financial year determines annual limits
- Multiple departments supported
- Real-time status updates`,
   },

   leave_recall_approval: {
      keywords: [
         'leave recall approval',
         'recall approval',
         'approve leave recall',
         'recall application',
         'leave recall review',
         'recall approval workflow',
         'leave recall management',
         'recall request approval',
      ],
      response: `📋 **Leave Recall Approval - Quick Guide:**

1. Go to Transactions → Attendance Management → Leave → Leave Recall Approval
2. Select and view a Recall Request from the list
3. Employee Details
   - Employee name and department
   - Current recall status
   
4. Leave Details
   - Leave Type (Casual, Earned, Sick, etc.)
   - Original Date Range
   - Half-day information
   - Total days being recalled
   - Paid/Unpaid breakdown
5. Click Print button
6. Click Back arrow to return to recall approval list

🔗 **Click here to go:** '[Go to Leave Recall Approval →](/transactions/attendance-management/leave/leave-recall-approval)'
💡 **Pro Tips:**
- Final approval automatically reverses leave transaction
- Leave balance is restored immediately after final approval
- Query remarks are visible to the applicant
- Recall cannot be undone after final approval
- Original leave type and dates are preserved`,
   },

   leave_cancel_approval: {
      keywords: [
         'leave cancel approval',
         'cancel approval',
         'approve leave cancellation',
         'cancel application review',
         'leave cancellation workflow',
         'cancel approval management',
         'leave cancel approval',
         'cancellation request approval',
      ],
      response: `📋 **Leave Cancel Approval - Quick Guide:**

1. Go to Transactions → Attendance Management → Leave → Leave Cancel Approval
2. Select and view a Cancellation Request from the list

3. Employee Details
   - Employee name and department
   - Current cancellation status
4. Leave Details
   - Leave Type (Casual, Earned, Sick, etc.)
   - Original Date Range
   - Half-day information
   - Total days being cancelled
   - Paid/Unpaid breakdown

5. Click Print button

🔗 **Click here to go:** '[Go to Leave Cancel Approval →](/transactions/attendance-management/leave/leave-cancel-approval)'
💡 **Pro Tips:**
- Final approval automatically reverses leave transaction
- Leave balance is restored immediately after final approval
- Query remarks are visible to the applicant
- Cancellation cannot be undone after final approval
- Original leave type and dates are preserved
- Real-time status updates on approval/query
- Transaction reversal prevents double counting

`,
   },

   //reports/budget-management

   departmentwise_budget_summary: {
      keywords: [
         'departmentwise budget summary',
         'department wise budget',
         'budget summary report',
         'revenue expense summary',
         'department budget report',
         'financial year budget',
         'budget comparison report',
         'department revenue expense',
         'budget summary by department',
      ],
      response: `📋 **Department-wise Budget Summary - Quick Guide:**

1. Go to Reports → Budget Management → Department-wise Budget Summary
2. Select Financial Year (Mandatory)
   - Current Year - Latest financial year data
   - Previous Year - Historical comparison data
3. Generate Report
   - Click Generate Report button
   - System fetches department-wise data
4. Department Name
   - Department/Division name
5. Revenue (₹)
   - Total revenue for the department
6. Expense (₹)
   - Total expenses for the department
7. Difference (₹)
8. Percentage (%)
9. Export to Excel
10. Print Report

🔗 **Click here to go:** '[Go to Departmentwise Budget →](/reports/budget-management/departmentwise-budget)'
    
💡 Pro Tips:
- Use for annual budget review
- Compare current vs previous years
- Identify high-performing departments
- Track budget utilization
- Export Excel for deeper analysis
- Print for official documentation

`,
   },
   accountwise_budget_summary: {
      keywords: [
         'accountwise budget summary',
         'account wise budget',
         'budget summary report',
         'account wise report',
         'budget by account',
         'financial year budget',
         'account group budget',
         'budget summary by account group',
         'revenue income expense report',
      ],
      response: `📋 **Account-wise Budget Summary - Quick Guide:**

1. Go to Reports → Budget Management → Account-wise Budget Summary

2. Select Financial Year
   - All (Both Years)** - Compare current and previous
   - Current Year** - Current financial year only
   - Previous Year - Previous financial year only
   - Auto-displays FY codes

3. Select Main Group Name
   - All Groups - Shows all account groups
   - Revenue Income - Income accounts only
   - Revenue Expense - Expense accounts only
   - Capital Income - Capital income accounts
   - Capital Expense - Capital expense accounts
   - Filters by account category

4. Generate Report
5. Export to Excel
6. Print Report

🔗 **Click here to go:** '[Go to Accountwise budget summary →](/reports/budget-management/accountwise-budget)'
    
💡 Pro Tips:
- Use "All" to compare both years
- Filter by group for focused view
- Green = Income, Red = Expense
- Excel export preserves hierarchy
- Print for official documentation`,
   },

   budget_comparison: {
      keywords: [
         'budget comparison',
         'budget yearly comparison',
         'department budget comparison',
         'budget variance report',
         'budget comparison report',
         'financial year comparison',
         'budget growth report',
         'department wise budget comparison',
      ],
      response: `📋 **Budget Yearly Comparison - Quick Guide:**

1. Go to Reports → Budget Management → Budget Yearly Comparison Report

2. Generate Report
   - Click Generate Report button
3. Department Name
   - Department/Division name
4. Previous Year Amount (₹)
   - Previous financial year budget
5. Current Year Amount (₹)
   - Current financial year budget
6. Percentage Change (%)
   - Year-over-year growth/decline
7. Export to Excel
8. Print Report

🔗 **Click here to go:** '[Go to Budget comparison →](/reports/budget-management/comparison)'

💡 Pro Tips:
- Instant report without filters
- Compare budgets year-over-year
- Identify best performing departments
- Track budget growth trends
- Export Excel for detailed analysis
- Print for official documentation
- Monitor department-wise performance`,
   },

   budget_utilization: {
      keywords: [
         'budget utilization',
         'budget utilization report',
         'budget utilization summary',
         'budget vs actual',
         'budget consumption',
         'budget utilization by department',
         'budget utilization percentage',
         'budget tracking report',
         'budget performance report',
      ],
      response: `📋 **Budget Utilization Report - Quick Guide:**

1. Go to Reports → Budget Management → Utilization Report
2. Select Financial Year (Mandatory)
   - Dropdown with available financial years
3. Select Department
   - Search by name or description
4. Generate Report
   - Click Generate Report button
5. Export to Excel
6. Print Report

🔗 **Click here to go:** '[Go to Budget Utilization →](/reports/budget-management/utilization)'

💡 **Pro Tips:**
- Use "All Departments" for overview
- Select specific department for deep dive
- Monitor utilization percentage regularly
- Green = Good, Red = Over-budget
- Search for specific account heads`,
   },

   department_budget_summary: {
      keywords: [
         'department budget summary',
         'department wise budget summary',
         'budget summary by department',
         'department budget report',
         'budget group summary',
         'revenue income budget',
         'revenue expense budget',
         'capital income budget',
         'capital expense budget',
      ],
      response: `📋 **Department Budget Summary - Quick Guide:**

1. Go to Reports → Budget Management → Department Budget Summary
2. Select Group (Mandatory)
   - All Groups - Shows all budget groups
3. Select Financial Year (Mandatory)
   - All (Both Years)- Compare both years
   - Current Year - Current financial year only
   - Previous Year - Previous financial year only
4. Select Department
5. Generate Report
6. Export to Excel
7. Print Report

🔗 **Click here to go:** '[Go to department budget summary →](/reports/budget-management/department-budget-summary)'
   
💡 **Pro Tips:**
- Click department rows to see budget items
- Use "All Groups" for complete overview
- Filter by group for focused analysis
- Export Excel for detailed analysis
- Print all departments expanded
- Green rows show positive balances`,
   },

   //reports/tender-management

   tender_register: {
      keywords: [
         'tender register',
         'tender register report',
         'tender management',
         'tender list',
         'tender register view',
         'tender report',
         'tender summary',
         'tender tracking',
         'tender management report',
      ],
      response: `📋 **Tender Register - Quick Guide:**

1. Go to Report -> Tender Management → Tender Register
2. Select Department
3. Select Tender Type
   - Dropdown of all tender types
4. Generate Report
5. Tender Type
   - Type/category of tender
6. Tender Date
7. Start Date
8. End Date
9. Export to Excel
10. Print Report

🔗 **Click here to go:** '[Go to tender Register →](/reports/tender-management/tender-register)'

💡Pro Tips:
- Use date range for period-specific reports
- Search within results for quick lookup
- Export Excel for analysis
- Print for official documentation
- Department filter for focused view
- Tender type filter for category reports
- All filters are optional
- Pagination for large datasets
- Auto-formatted amounts in ₹
- Summary totals at bottom`,
   },

   tender_allocation_report: {
      keywords: [
         'tender allocation report',
         'tender allocation',
         'tender allocation view',
         'tender work order report',
         'tender vendor allocation',
         'tender allocation summary',
         'tender award report',
         'tender assignment report',
      ],
      response: `📋 **Tender Allocation Report - Quick Guide:**

1. Go to Tender Management → Tender Allocation Report
2. Date Range Filters
3. Department
   - Search by name or description
4. Tender Type
   - Searchable dropdown of tender types
5. Vendor
   - Searchable dropdown of all vendors
6. Tender
   - Shows tender description and type
7. Generate Report
   - Click Generate Report button
8. Tender Type
    - Type/category of tender
    - From Tender Type master
9. Tender Date
    - Date when tender was created
    - Formatted as DD-MM-YYYY
10. Export to Excel
11. Print Report
    
🔗 **Click here to go:** '[Go to tender allocation report →](/reports/tender-management/tender-allocation)'

💡 **Pro Tips:**
- Use date range for period-specific reports
- Search within results for quick lookup
- Export Excel for analysis
- Print for official documentation
- Department filter for focused view
- Vendor filter for specific supplier tracking`,
   },

   vendorwise_reg: {
      keywords: [
         'vendorwise tender register',
         'vendor wise tender register',
         'vendor tender report',
         'vendor tender register',
         'vendor wise report',
         'tender register by vendor',
         'vendor tender summary',
         'vendor work order report',
         'vendor performance report',
      ],
      response: `📋 **Vendor-wise Tender Register - Quick Guide:**

1. Go to Reports → Tender Management → Vendor-wise Tender Register
2. Select Vendor
   - Searchable dropdown of all vendors
   - Shows vendor name and code
3. Date Range Filters
   - From Date - Start date for tenders
   - To Date - End date for tenders
4. Sort Order
   - Dropdown with sort options:
     - Work Order Amount (High to Low) - Default
     - Work Order Amount (Low to High)
     - Tender Proposed Amount (High to Low)
     - Tender Proposed Amount (Low to High)
     - Tender Date (Newest First)
     - Tender Date (Oldest First)

5. Generate Report
   
🔗 **Click here to go:** '[Go to Vendor-wise Tender Register →](/reports/tender-management/vendorwise-reg)'

💡 **Pro Tips:**
- Use "All Vendors for complete overview
- Filter by specific vendor for focused view
- Sort by Work Order Amount for top vendors
- Date range for period-specific analysis
- Export Excel for further analysis`,
   },

   over_budgeted_work_order: {
      keywords: [
         'over budgeted work order',
         'over budget report',
         'budget overshoot report',
         'work order budget excess',
         'budget vs actual report',
         'over budget analysis',
         'budget overspending report',
      ],
      response: `📋 **Over Budgeted Work Orders - Quick Guide:**

1. Go to Reports → Tender Management → Over Budgeted Work Orders
2. Select Department (Mandatory)
   - Click dropdown to search departments
   - Search by name or description
3. Financial Year
   - Dropdown of available financial years
   - Shows current year indicator
4. Tender Type
   - Dropdown of tender types
   - Auto-loaded from report data
5. Date Range
   - From Date - Calendar picker
   - To Date - Calendar picker
6. Min Over Budget (₹)
   - Enter minimum overshoot amount
7. Generate Report
8. Search by Budget Head
   - Search box above table
9. Export to Excel - Click Excel button
10. Print Report - Click Print button

🔗 **Click here to go:** '[Go to Over Budgeted Work Orders Report →](/reports/tender-management/over-budgeted)'

💡 **Pro Tips:**
- Department is mandatory for generation
- Use Min Over Budget to filter significant issues
- Red highlights show budget overshoots
- Search by budget head for quick lookup
- Track budget compliance and identify problem areas`,
   },

   pending_tender: {
      keywords: [
         'pending tender report',
         'non allotted tender',
         'pending tender list',
         'unallocated tender',
         'tender pending report',
         'pending tender tracking',
         'non allotted tenders report',
         'tender status report',
      ],
      response: `📋 **Non-Allotted / Pending Tenders Report - Quick Guide:**

1. Go to Reports → Tender Management → Non-Allotted / Pending Tenders Report
2. Select Department
   - Click dropdown to search departments
   - Search by name or description
3. Date Range
   - From Date - Calendar picker
   - To Date - Calendar picker
4. Amount Range
   - Min Amount (₹) - Enter minimum proposed amount
   - Max Amount (₹) - Enter maximum proposed amount
   - Filters tenders by proposal amount
5. Include Expired Tenders
   - Toggle switch (On/Off)
   - Default: Off
6. Generate Report
   - Click Generate Report button
7. Export to Excel - Click Excel button
8. Print Report - Click Print button

🔗 **Click here to go:** '[Go to Pending Tender  →](/reports/tender-management/pending-tender)'

💡 Pro Tips:
- Department defaults to "All Departments"
- Use amount range to filter by proposal value
- Toggle expired tenders to include or exclude`,
   },

   bg_register: {
      keywords: [
         'bg register',
         'bank guarantee register',
         'bg register report',
         'bank guarantee report',
         'bg tracking',
         'bank guarantee tracking',
         'bg management',
         'bank guarantee register view',
      ],
      response: `📋 **BG Register - Quick Guide:**

1. Go to Tender Management → BG Register
2. Date Range
   - From Date - Calendar picker
   - To Date - Calendar picker
3. Tender
   - Click dropdown to search tenders
   - Shows tender type and amounts
4. Vendor
   - Click dropdown to search vendors
   - Shows vendor name and city/phone
5. Work Allocation
   - Click dropdown to search work orders
   - Shows work order ID and vendor
6. Generate Report
   - Click Generate Report button
7. Export to Excel - Click Excel button
8. Print Report - Click Print button

🔗 **Click here to go:** '[Go to BG Register →](/reports/tender-management/bg-register)'

💡 **Pro Tips:**
- All filters are optional
- Use date range for period-specific reports
- Search by vendor or work order for quick lookup
- Status badges show BG validity at a glance
- Track BG maturity dates for renewals

`,
   },
   departmentwise_emd_register: {
      keywords: [
         'departmentwise emd register',
         'department wise emd register',
         'emd register',
         'emd by department',
         'department emd report',
         'emd tracking report',
         'emd register report',
      ],
      response: `📋 **Departmentwise EMD Register - Quick Guide:**

1. Go to Reports → Tender Management → Departmentwise EMD Register
2. Click On Department
3. Select Date Range
4. Tender
   - Click dropdown to search tenders
   - Shows tender description
5. Vendor
   - Click dropdown to search vendors
   - Shows vendor name
6. Generate Report
   - Click Generate Report button

🔗 **Click here to go:** '[Go to department emd register →](/reports/tender-management/departmentwise-emd-register)'  

💡 **Pro Tips:**
- All filters are optional
- Department grouping shows EMDs by department
- Grand Total shows overall EMD collection
- Search by vendor or tender for quick lookup
- Status badges show EMD validity`,
   },

   over_budgeted_work_order: {
      keywords: [
         'over budgeted work order',
         'over budget report',
         'budget overshoot report',
         'work order budget excess',
         'budget vs actual report',
         'over budget analysis',
         'budget overspending report',
         'tender budget report',
      ],
      response: `📋 **Over Budgeted Work Orders - Quick Guide:**

1. Go to Reports → Tender Management → Over Budgeted Work Orders
2. Department (Mandatory)
   - Click dropdown to search departments
3. Financial Year
   - Dropdown of available financial years
4. Tender Type
   - Dropdown of tender types
5. Date Range
   - From Date - Calendar picker
   - To Date - Calendar picker
6. Min Over Budget (₹)
   - Enter minimum overshoot amount
7. Generate Report
   - Click Generate Report button
8. Export to Excel - Click Excel button
9. Print Report - Click Print button

🔗 **Click here to go:** '[Go to over budgeted work orders →](/reports/tender-management/over-budgeted)'

💡 **Pro Tips:**
- Department is mandatory for generation
- Use Min Over Budget to filter significant issues
- Red highlights show budget overshoots
- Search by budget head for quick lookup`,
   },

   active_work_orders: {
      keywords: [
         'active work orders',
         'work order report',
         'active work orders report',
         'work order list',
         'active work order report',
         'work order tracking',
         'work order summary',
      ],
      response: `📋 **Active Work Orders Report - Quick Guide:**

1. Go to Reports → Tender Management → Active Work Orders Report
2. Filter by Department 
   - Click dropdown to search departments
3. Filter by Vendor
   - Click dropdown to search vendors
4. Date Range
   - From Date - Calendar picker
   - To Date - Calendar picker
5. Amount Range
   - Min Amount (₹) - Enter minimum amount
   - Max Amount (₹) - Enter maximum amount

6. Export to Excel - Click Excel button
7. Print Report - Click Print button

🔗 **Click here to go:** '[Go to active work orders →](/reports/tender-management/active-wo)'

💡 **Pro Tips:**
- All filters are optional
- Auto-loads data on page load
- Department and Vendor dropdowns are searchable
- Use date range for period-specific reports
- Amount range helps filter by value`,
   },

   departmentwise_active_work_orders: {
      keywords: [
         'departmentwise active work orders',
         'department wise work orders',
         'active work orders by department',
         'work order report by department',
         'department work order report',
         'active work order list',
         'departmentwise work order report',
      ],
      response: `📋 **Departmentwise Active Work Orders Report - Quick Guide:**

1. Go to Reports → Tender Management → Departmentwise Active Work Orders Report
2. Department
   - Click dropdown to search departments
3. Vendor
   - Click dropdown to search vendors
   - Shows vendor name and code/email
4. Date Range
   - From Date - Calendar picker
   - To Date - Calendar picker
5. Generate Report
   - Click Generate Report button
   - Applies all selected filters

6. Export to Excel - Click Excel button
7. Print Report - Click Print button

🔗 **Click here to go:** '[Go to departmentwise_active_work_orders →](/reports/tender-management/departmentwise-active-wo)'

💡 **Pro Tips:**
- Department is required but defaults to "All Departments"
- Vendor dropdown is searchable
- Date range helps filter by period
- Status badges show work order state
- Summary row shows totals and completion
- Excel export includes summary sheet
- All filters are optional except Department`,
   },

   //reports/cash-bank

   ledger: {
      keywords: [
         'ledger',
         'ledger report',
         'bank book',
         'ledger view',
         'ledger transactions',
         'ledger statement',
         'bank ledger',
         'account ledger',
         'ledger details',
      ],
      response: `📋 **Ledger Report - Quick Guide:**

1. Go to Reports → Core Ledger → Ledger Report
2. Select Ledger 
   - Click dropdown to search ledgers
   - Shows ledger name, code, and group
3. Date Range
   - From Date - Calendar picker
   - To Date - Calendar picker
4. Search in Results
   - Search box above table
   - Filter by: Description, Voucher ID, Opposite Ledger, Sub Ledger
5. Print Report - Click Print button
6. Export to Excel - Click Excel button

💡 **Pro Tips:**
- Ledger selection is mandatory
- Date filters help narrow down period
- Search works across multiple fields
- Running balance updates with each transaction
- Totals show summary at bottom
- Excel export includes both summary and details sheets
- Print shows complete ledger statement`,
   },

   summary_income_report: {
      keywords: [
         'summary income report',
         'income report',
         'challan income report',
         'summary challan report',
         'income summary report',
         'cash bank income report',
         'income transaction report',
         'challan summary',
      ],
      response: `📋 **Summary Challan/Income Report - Quick Guide:**

1. Go to Reports → Cash & Bank → Summary Challan/Income Report
2. Date From
3. Date To
4. Department
   - Click dropdown to search departments
5. Generate Report
6. Export to Excel - Click Excel button
7. Print Report - Click Print button

🔗 **Click here to go:** '[Go to summary income report →](/reports/cash-bank/summary-income-report)'

💡 **Pro Tips:**
- Date range defaults to today's date
- Department filter is optional
- Click Receipt No to view transaction details
- Grand Total shows summary by payment mode
- Print includes signature lines for approval
- Excel export includes all columns

`,
   },

   challan_status_summary_report: {
      keywords: [
         'challan status summary',
         'challan status report',
         'challan status summary report',
         'challan status',
         'challan tracking',
         'challan summary',
         'status summary report',
         'challan status by department',
      ],
      response: `📋 **Challan Status Summary Report - Quick Guide:**

1. Go to Reports → Cash & Bank → Challan Status Summary Report
2. Date From
   - Calendar picker
3. Date To
   - Calendar picker
4. Department
   - Click dropdown to search departments
5. Status
   - Click dropdown to search statuses
   - Shows all available status options
6. Generate Report
   - Click Generate Report button
7. Level 1 - Department Row 
   - Shows department name with folder icon
8. Level 2 - Challan Row
   - Shows Challan No, Date, Head Name, Party Name
9. Level 3 - Challan Details
    - Payment Details - Mode, Amount, Transaction ID, Payment Date
    - Bank Details - Account No, Bank Name, IFSC Code, Cheque No
10. Export to Excel - Click Excel button
11. Print Report - Click Print button

🔗 **Click here to go:** '[Go to challan status summary report →](/reports/cash-bank/summary-expense-report)'

💡 **Pro Tips:**
- Click Department to view challans
- Click Challan to view payment details
- Status badges show current status
- Grand Total at bottom shows overall sum
- Excel export includes all levels
- Print shows full report with all details`,
   },

   payment_status_report: {
      keywords: [
         'payment status report',
         'payment status',
         'payment status summary',
         'payment tracking report',
         'payment status by department',
         'payment voucher status',
         'challan payment status',
         'payment report',
      ],
      response: `📋 Payment Status Report - Quick Guide:

1. Go to Reports → Cash & Bank → Payment Status Report
2. Date From
3. Date To
4. Department
   - Click dropdown to search departments
5. Status
   - Click dropdown to search statuses
6. Generate Report
   - Click Generate Report button
7. Export to Excel - Click Excel button
8. Print Report - Click Print button

🔗 **Click here to go:** '[Go to payment status report →](/reports/cash-bank/payment-status-report)'

💡 **Pro Tips:** 
- Click Department to view payment vouchers
- Click Payment voucher to view payment details
- Status badges show current status
- Grand Total at bottom shows overall sum
- Shows only expense/income = "N" vouchers
- Excel export includes all levels with payment details`,
   },

   day_book_report: {
      keywords: [
         'day book report',
         'daybook report',
         'day book',
         'daily transaction report',
         'day book summary',
         'cash book report',
         'bank book report',
         'daily book report',
      ],
      response: `📋 **Day Book Report - Quick Guide:**

1. Go to Reports → Cash & Bank → Day Book Report
2. Date From
3. Date To
4. Department
   - Click dropdown to search departments
5. Generate Report
   - Click Generate Report button
6. Export to Excel - Click Excel button
7. Print Report - Click Print button

🔗 **Click here to go:** '[Go to day book report →](/reports/cash-bank/day-book-report)'

💡 **Pro Tips:**
- Shows 6 payment modes with income/expense/balance
- Cash mode has additional balance column
- Total columns show aggregate across all modes
- Negative balance shown in bold
- Grand Total row at bottom shows summary
- Excel export includes all payment mode columns`,
   },

   check_deposit_slip_report: {
      keywords: [
         'check deposit slip',
         'deposit slip report',
         'cheque deposit slip',
         'deposit slip',
         'bank deposit slip',
         'deposit slip print',
         'cheque deposit report',
         'cash deposit slip',
      ],
      response: `📋 **Deposit Slip Report - Quick Guide:**

1. Go to Reports → Core Ledger → Check/Deposit Slip Report
2. Date From
3. Date To
4. Payment Type
   - Cheque/DD - Cheque and DD transactions only
   - Cash - Cash transactions only
   - Both - Both Cheque/DD and Cash transactions
   - Default: Cheque/DD

5. Generate Report
   - Click Generate Report button
   - For Cash/Both Opens Denomination Dialog
   - For Cheque/DD: Direct report generation

6. Export to Excel - Click Excel button
7. Print Report - Click Print button
    - Prints deposit slip format

🔗 **Click here to go:** '[Go to check deposit slip report →](/reports/cash-bank/check-deposite-slip-report)'

💡 **Pro Tips:**
- Default date is today's date
- Cheque/DD mode shows cheque numbers
- Cash mode requires denomination entry
- Denomination total must match cash total
- Both mode shows separate slips for Cheque and Cash
- Print generates formal deposit slip format
- Amount shown in words for official use`,
   },

   departmentwise_cashbook_report: {
      keywords: [
         'departmentwise cashbook',
         'department wise cashbook',
         'cashbook report',
         'department cashbook',
         'cashbook by department',
         'department wise cash report',
         'cash transaction report',
         'department cash summary',
      ],
      response: `📋 **Department-wise Cashbook Report - Quick Guide:**

1. Go to Reports → Cash & Bank → Department-wise Cashbook Report
2. From Date
3. To Date
4. Department
   - Click dropdown to search departments
5. Generate Report
   - Click Generate Report button
6. Export to Excel - Click Excel button
7. Print Report - Click Print button
    
🔗 **Click here to go:** '[Go to departmentwise cashbook report →](/reports/cash-bank/departmentwise-cashbook-report)'

💡 **Pro Tips:**
- Default dates are set to today
- Click ledger rows to expand transaction details
- Right panel shows challan in Gujarati
- Amount appears in words for official use
- Grand Total shows overall cash amount
- Print generates formal challan format`,
   },

   dymc_approval: {
      keywords: [
         'dymc approval',
         'dymc approval report',
         'bank payment report',
         'dymc approval bill',
         'payment approval report',
         'bank payment approval',
         'dymc payment report',
         'approval bill report',
      ],
      response: `📋 **DYMC Approval Bill Report - Quick Guide:**

1. Go to Reports → Cash & Bank → DYMC Approval Bill Report
2. Date From
3. Date To
4. Payment Mode
   - Click dropdown to search payment modes
   - Shows payment mode name with type (Digital/Cash)
5. Status
   - Click dropdown to search statuses
6. Department
   - Click dropdown to search departments
7. Generate Report
   - Click Generate Report button
8. Export to Excel - Click Excel button
9. Print Report - Click Print button

🔗 **Click here to go:** '[Go to dymc approval →](/reports/cash-bank/dymc-approval-bill)'

💡 **Pro Tips:**
- Default status is "DYMC Approval"
- Payment Mode dropdown shows Digital/Cash indicators
- Beneficiary account numbers preserve leading zeros in Excel export
- Payment Detail 1 shows only last digits of voucher/challan
- Print includes signature lines for approval
- Excel export includes styled header and alternating row colors`,
   },

   //reports/core-ledger
   trial_balance: {
      keywords: [
         'trial balance',
         'trial balance report',
         'trial balance statement',
         'accounting trial balance',
         'ledger trial balance',
         'trial balance summary',
         'financial trial balance',
         'trial balance ledger',
      ],
      response: `📋 **Trial Balance Report - Quick Guide:**

1. Go to Reports → Core Ledger → Trial Balance Report
2. Financial Year (Mandatory)
   - Dropdown of available financial years
   - Shows current year indicator
3. Date Range (Mandatory)
   - From Date - To Date 
4. Generate Report
   - Click Generate Report button
5. Print Report - Click Print button
6. Export to Excel - Click Excel button
   
🔗 **Click here to go:** '[Go to trial balance →](/reports/core-ledger/trialbalance)'

💡 **Pro Tips:**
- Financial Year auto-selects current year
- Date range defaults to FY start date
- Grand Total shows only on last page
- Yellow highlighted total row for easy identification
- Export Excel for detailed analysis
- Print for official documentation`,
   },

   trial_details: {
      keywords: [
         'trial details',
         'detailed trial balance',
         'trial balance details',
         'detailed trial balance report',
         'trial balance with details',
         'trial balance detail report',
         'trial balance detailed view',
      ],
      response: `📋 **Detailed Trial Balance Report - Quick Guide:**

1. Go to Reports → Core Ledger → Detailed Trial Balance Report
2. Organisation (Auto-loaded)
   - Shows current organisation name
3. Financial Year (Auto-loaded)
   - Shows current financial year
4. As On Date (Mandatory)
5. Search
   - Filter by: Code, Ledger Name, Group
6. Reset Filters
   - Click Reset Filters button
7. Print Report - Click Print button
8. Export to Excel - Click Excel button

🔗 **Click here to go:** '[Go to trial details →](/reports/core-ledger/trialdetail)'

💡 **Pro Tips:**
- Organisation and Financial Year auto-load
- As On Date defaults to today
- Red text = Debit balance, Green text = Credit balance
- Search across multiple columns
- Totals shown at bottom of table
- Excel export includes summary and details sheets
- Print includes all formatting`,
   },

   ledger_report: {
      keywords: [
         'ledger report',
         'general ledger',
         'ledger statement',
         'ledger transactions',
         'ledger account',
         'general ledger report',
         'ledger details',
         'account ledger',
      ],
      response: `📋 **General Ledger Report - Quick Guide:**

1. Go to Reports → Core Ledger → General Ledger Report
2. Select Ledger (Mandatory)
   - Click dropdown to search ledgers
3. Date Range
   - From Date - To Date 
4. Print Report - Click Print button
5. Export to Excel - Click Excel button

🔗 **Click here to go:** '[Go to attendance record entry →](/reports/core-ledger/ledger)'

💡 **Pro Tips:**
- Ledger selection is mandatory
- Date filters help narrow down period
- Search works across multiple fields
- Running balance updates with each transaction
- Totals show summary at bottom
- Excel export includes both summary and details sheets
- Print shows complete ledger statement`,
   },

   sub_ledger_report: {
      keywords: [
         'sub ledger report',
         'sub ledger',
         'sub ledger transactions',
         'sub ledger statement',
         'sub ledger account',
         'agent ledger report',
         'sub ledger details',
         'sub ledger transactions report',
      ],
      response: `📋 **Sub-Ledger Report - Quick Guide:**

1. Go to Reports → Core Ledger → Sub-Ledger Report
2. Select Head Ledger (Mandatory)
   - Click dropdown to search ledgers
3. Select Sub-Ledger (Mandatory)
   - Click dropdown to search sub-ledgers
4. Generate Report
5. Print Report - Click Print button
6. Export to Excel - Click Excel button

🔗 **Click here to go:** '[Go to attendance record entry →](/reports/core-ledger/subledger)'

💡 **Pro Tips:**
- Both Head Ledger and Sub-Ledger selection are mandatory
- Sub-ledger list filters based on selected head ledger
- Search within results for quick lookup
- Excel export includes summary and details sheets
- Print shows complete sub-ledger statement
- PAN and GSTIN displayed for reference`,
   },

   sub_ledger_summary: {
      keywords: [
         'sub ledger summary',
         'sub ledger balance summary',
         'sub ledger summary report',
         'sub ledger balances',
         'sub ledger balance report',
         'sub ledger summary by ledger',
         'sub ledger account summary',
      ],
      response: `📋 **Sub-Ledger Summary - Quick Guide:**

1. Go to Reports → Core Ledger → Sub-Ledger Summary
2. Financial Year
   - Dropdown of available financial years
3. Date Range
   - From Date - To Date
4. Ledger (Mandatory)
   - Click dropdown to search ledgers
5. Generate Report
6. Export to Excel - Click Excel button
7. Print Report - Click Print button

🔗 **Click here to go:** '[Go to sub ledger →](/reports/core-ledger/subledger-summary)'

💡 **Pro Tips:**
- Ledger selection is mandatory
- Sub-ledgers show individual balances
- Grand Total shows overall summary
- Transaction table shows detailed activity
- Search transactions by description or voucher type
- Excel export includes all data
- Print shows professional summary format`,
   },

   journal_register: {
      keywords: [
         'journal register',
         'journal report',
         'journal voucher report',
         'journal register report',
         'journal entries',
         'journal voucher register',
         'journal summary',
         'journal detailed report',
      ],
      response: `📋 **Journal Register - Quick Guide:**

1. Go to Reports → Core Ledger → Journal Register
2. Date Range
   - From Date - To Date
3. Search in Results
   - Search box above table
   - Filter by: Account Name, Voucher No, Voucher Type, Amount
4. Print Report - Click Print button
5. Export to Excel - Click Excel button
   
🔗 **Click here to go:** '[Go to journal register →](/reports/core-ledger/journal)'

💡 **Pro Tips:**
- Auto-loads all journal vouchers on page load
- Each voucher shows with a total row
- Grand Totals show overall summary
- Search across multiple fields
- Date filter shows period range
- Three report types for Excel export
- Print supports all three report types`,
   },

   contra_register: {
      keywords: [
         'contra register',
         'contra report',
         'contra voucher report',
         'contra register report',
         'contra entries',
         'contra voucher register',
         'contra summary',
         'contra detailed report',
      ],
      response: `📋 **Contra Register - Quick Guide:**

1. Go to Reports → Core Ledger → Contra Register
2. Date Range
   - From Date - To Date
3. Search in Results
   - Search box above table
   - Filter by: Account Name, Voucher No, Voucher Type, Amount
4. Export to Excel - Click Excel button
5. Print Report - Click Print button

🔗 **Click here to go:** '[Go to contra register →](/reports/core-ledger/contra)'

💡 **Pro Tips:**
- Auto-loads all contra vouchers on page load
- Each voucher shows with a total row
- Grand Totals show overall summary
- Search across multiple fields
- Date filter shows period range
- Three report types for Excel export
- Print supports all three report types`,
   },

   opening_balance_register: {
      keywords: [
         'opening balance register',
         'opening balance report',
         'opening balance voucher',
         'opening balance register report',
         'opening balance entries',
         'opening balance summary',
         'opening balance detailed report',
      ],
      response: `📋 **Opening Balance Register - Quick Guide:**

1. Go to Reports → Core Ledger → Opening Balance Register
2. Date Range
   - From Date- To Date
3. Report Type - Select from dropdown:
    - Complete Report - Summary + Detailed entries
    - Summary Only - Voucher-wise summary only
    - Detailed Only - Individual entries only
4. Print Report - Click Print button
5. Export to Excel - Click Excel button

🔗 **Click here to go:** '[Go to attendance record entry →](/reports/core-ledger/openingbalance-reg)'

💡 **Pro Tips:**
- Auto-loads OPB vouchers on page load
- Each voucher shows with a total row
- Grand Totals show overall summary
- Report Type dropdown controls export/print format
- Date filter shows period range`,
   },

   //reports/annual-financial
   balance_sheet: {
      keywords: [
         'balance sheet',
         'balance sheet report',
         'financial balance sheet',
         'balance sheet statement',
         'assets liabilities report',
         'annual balance sheet',
         'financial statement',
         'balance sheet summary',
      ],
      response: `📋 **Balance Sheet - Quick Guide:**

1. Go to Reports → Annual Financial → Balance Sheet
2. Date Range
   - From Date - To Date
3. Generate Report
4.Export to Excel - Click Excel button
5. Print Report - Click Print button

🔗 **Click here to go:** '[Go to balance sheet →](/reports/annual-financial/balancesheet)'

💡 **Pro Tips:**
- Default date range is current month to today
- Assets and Liabilities sections are clearly separated
- Hierarchical indentation shows account structure
- Red text indicates leaf account items
- Blue text indicates category/sub-category items
- Total rows are highlighted in sky blue`,
   },

   income_expenditure: {
      keywords: [
         'income expenditure',
         'profit and loss',
         'profit & loss statement',
         'income expense report',
         'p&l statement',
         'profit loss report',
         'income statement',
         'income expenditure report',
      ],
      response: `📋 **Profit & Loss Statement - Quick Guide:**

1. Go to Reports → Finance → Profit & Loss Statement
2. Date Range
   - From Date - To Date
3. Generate Report
4. Export to Excel - Click Excel button
5. Print Report - Click Print button

🔗 **Click here to go:** '[Go to income expenditure  →](/reports/annual-financial/income-expenditure)'

💡 **Pro Tips:**
- Default date range is current month to today
- Income and Expenses sections are clearly separated
- Red text indicates individual (leaf) items
- Blue text indicates category/sub-category items
- Summary shows Total Income, Total Expenses, and Net Profit/Loss`,
   },

   cash_flow_statement: {
      keywords: [
         'cash flow statement',
         'cash flow report',
         'cash flow',
         'cash flow statement report',
         'cash flow analysis',
         'cash flow summary',
         'cash flow period report',
      ],
      response: `📋 **Cash Flow Statement - Quick Guide:**

1. Go to Reports → Finance → Cash Flow Statement
2. Start Date
3. End Date
4. Generate Report
5. Export to Excel - Click Excel button
6. Print Report - Click Print button

🔗 **Click here to go:** '[Go to cash flow statement →](/reports/annual-financial/cash-flow-statement)'

💡 **Pro Tips:**
- Default period is last month
- Sections show operating, investing, and financing activities
- Sub-totals shown for each section
- Green amounts = Positive cash flow (inflow)
- Red amounts = Negative cash flow (outflow)
- Summary shows net cash position`,
   },

   assets_register_summary: {
      keywords: [
         'assets register summary',
         'asset register',
         'asset summary report',
         'assets register report',
         'asset register summary',
         'fixed assets register',
         'asset register summary report',
      ],
      response: `📋 **Assets Register Summary - Quick Guide:**

1. Go to Reports → annual-financial → Assets Register Summary
2. As On Date
3. Generate Report
4. Export to Excel - Click Excel button
5. Print Report - Click Print button

🔗 **Click here to go:** '[Go to assets register summary →](/reports/annual-financial/assets-register-summary)'

💡 **Pro Tips:**
- Default date is today
- Hierarchical indentation shows asset structure
- Level 4 items show individual asset amounts in Red
- Category totals shown in Blue
- Total Assets shows overall sum
- As On Date determines asset valuation date`,
   },

   liabilities_register: {
      keywords: [
         'liabilities register',
         'liabilities register summary',
         'liabilities report',
         'liability register',
         'liabilities summary',
         'liabilities register report',
         'liability summary report',
      ],
      response: `📋 **Liabilities Register - Quick Guide:**

1. Go to Reports → Liabilities Register
2. Start Date
3. End Date
4. Generate Report
   - Click Generate Report button
5. Export to Excel - Click Excel button
6. Print Report - Click Print button

🔗 **Click here to go:** '[Go to liabilites register →](/reports/annual-financial/liabilities-register)'

💡 **Pro Tips:**
- Default period is financial year start to today
- Hierarchical indentation shows liability structure
- Level 1 items shown in Sky blue (Bold)
- Level 2 items shown in Blue
- Level 3+ items shown in Red
- Total Liabilities shows overall sum`,
   },
   //reports/salary-accounting

   salary_deduction: {
      keywords: [
         'salary deduction',
         'pay bill deduction',
         'deduction side',
         'pay bill inner sheet',
         'salary deduction report',
         'payroll deduction',
         'deduction register',
         'salary deduction summary',
      ],
      response: `📋 **Pay Bill Inner Sheet – Deduction Side - Quick Guide:**

1. Go to Reports → Payroll → Pay Bill Inner Sheet – Deduction Side
2. Month (Mandatory)
3. Year (Mandatory)
4. Bill Name
   - Click dropdown to search bill names
5. Department
   - Click dropdown to search departments
6. Employee
   - Click dropdown to search employees
7. Generate Report
   - Click Generate Report button
8. Export to Excel - Click Excel button
9. Print Report - Click Print button

🔗 **Click here to go:** '[Go to salary deduction →](/reports/salary-accounting/salary-deduction)'

💡 **Pro Tips:**
- Month and Year are mandatory
- Deductions are shown with two lines per employee
- Each deduction column shows two values (first line/second line)
- Page Total shows current page sum
- Grand Total shows overall sum on last page
- Amount in Words shows total in text format
- Department headers separate employee groups`,
   },

   salary_income: {
      keywords: [
         'salary income',
         'pay bill earning',
         'earning side',
         'pay bill inner sheet earning',
         'salary earning report',
         'payroll earning',
         'earning register',
         'salary income summary',
      ],
      response: `📋 **Pay Bill Inner Sheet – Earning Side - Quick Guide:**

1. Go to Reports → Payroll → Pay Bill Inner Sheet – Earning Side
2. Month (Mandatory)
   - Dropdown of months (January to December)
3. Year (Mandatory)
4. Bill Name
   - Click dropdown to search bill names
5. Department
   - Click dropdown to search departments
6. Employee
   - Click dropdown to search employees
7. Generate Report
   - Click Generate Report button
8. Export to Excel - Click Excel button
9. Print Report - Click Print button

🔗 **Click here to go:** '[Go to attendance record entry →](/reports/salary-accounting/salary-income)'

💡 **Pro Tips:**
- Month and Year are mandatory
- Each column shows earning amount for the employee
- Department headers show pay bill code and grade pay
- Page Total shows current page sum
- Grand Total shows overall sum on last page
- Employee code and basic pay shown in detail rows`,
   },

   //reports/leave-attendance

   employee_attendance: {
      keywords: [
         'employee leave report',
         'employee attendance',
         'leave report',
         'employee leave report',
         'attendance report',
         'leave application report',
         'employee leave summary',
         'leave register',
      ],
      response: `📋 **Employee Leave Report - Quick Guide:**

1. Go to Reports → Attendance → Employee Leave Report
2. Date Range
   - From Date - To Date 
3. Department
   - Click dropdown to search departments
4. Employee
   - Click dropdown to search employees
5. Generate Report
6. Export to Excel - Click Excel button
7. Print Report - Click Print button

🔗 **Click here to go:** '[Go to employee attendance →](/reports/leave-attendance/employee-attendance)'

💡 **Pro Tips:**
- Default date range is current month to today
- Department filter auto-filters employee list
- Employee dropdown shows code and email
- Paid/Unpaid days show leave breakdown
- Excel export excludes status and code columns
- Print shows all records in table format`,
   },

   //reports/listing
   zone_list: {
      keywords: [
         'zone list',
         'zones',
         'zone report',
         'zone listing',
         'zone master list',
         'zone register',
         'zone details',
         'list of zones',
      ],
      response: `📋 **Zone List - Quick Guide:**

1. Go to Reports → Listing → Zone List
2. Sr No - Serial number
3. Zone Code - Unique zone code/identifier
4. Zone Name - Name of the zone
5. Export to Excel 
6. Print Report

🔗 **Click here to go:** '[Go to zone list →](/reports/listing/zone)'

💡 **Pro Tips:**
- Auto-loads all zones on page load
- Search by code or name for quick lookup
- Print shows all filtered data
- Excel export includes formatted columns
- Pagination shows filtered results count`,
   },

   ward_list: {
      keywords: [
         'ward list',
         'wards',
         'ward report',
         'ward listing',
         'ward master list',
         'ward register',
         'ward details',
         'list of wards',
      ],
      response: `📋 **Ward List - Quick Guide:**

1. Go to Reports → Listing → Ward List
2. Sr No - Serial number
3. Ward Code - Unique ward code/identifier
4. Ward Name - Name of the ward
5. Zone Code - Associated zone code
6. Zone Name - Associated zone name
7. Export to Excel
8. Print Report

🔗 **Click here to go:** '[Go to ward list →](/reports/listing/ward)'

💡 **Pro Tips:**
- Auto-loads all wards on page load
- Search by code or name for quick lookup
- Zone information shows parent zone mapping
- Print shows all filtered data
- Excel export includes zone details`,
   },

   area_list: {
      keywords: [
         'area list',
         'areas',
         'area report',
         'area listing',
         'area master list',
         'area register',
         'area details',
         'list of areas',
      ],
      response: `📋 **Area List - Quick Guide:**

1. Go to Reports → Listing → Area List
2. S.No. - Serial number
3. Area Code - Unique area code/identifier
4. Area Name - Name of the area
5. Ward Code - Associated ward code
6. Ward Name - Associated ward name
7. Zone Code - Associated zone code
8. Zone Name - Associated zone name
9. Export to Excel
10. Print Report

🔗 **Click here to go:** '[Go to area list →](/reports/listing/area)'

💡 **Pro Tips:**
- Auto-loads all areas on page load
- Search by any field for quick lookup
- Shows complete location hierarchy (Area → Ward → Zone)
- Print shows all filtered data
- Excel export includes all seven columns
- Area level is the most granular location`,
   },

   ccc_list: {
      keywords: [
         'ccc list',
         'cccs',
         'ccc report',
         'ccc listing',
         'ccc master list',
         'ccc register',
         'ccc details',
         'list of cccs',
      ],
      response: `📋 **CCC List - Quick Guide:**

1. Go to Reports → Listing → CCC List
2. Sr No. - Serial number
3. CCC Code - Unique CCC code/identifier
4. CCC Name - Name of the CCC
5. Ward Code - Associated ward code
6. Ward Name - Associated ward name
7. Zone Code - Associated zone code
8. Zone Name - Associated zone name
9. Export to Excel
10. Print Report

🔗 **Click here to go:** '[Go to CCC list →](/reports/listing/ccc)'

💡 **Pro Tips:**
- Auto-loads all CCCs on page load
- Search by any field for quick lookup
- Shows complete location hierarchy (CCC → Ward → Zone)
- Print shows all filtered data
- Excel export includes all seven columns
- CCC is the most granular civic center level`,
   },

   department_list: {
      keywords: [
         'department list',
         'from where to see department page',
         'department report',
         'department listing',
         'department master list',
         'department register',
         'department details',
         'list of departments',
      ],
      response: `📋 **Department List - Quick Guide:**

1. Go to Reports → Listing → Department List
2. Sr No - Serial number
3.Department Name - Department name (Gujarati and English) with indentation for hierarchy
4. Department Code - Unique department code/identifier
5. Export to Excel
6. Print Report

🔗 **Click here to go:** '[Go to attendance record entry →](/reports/listing/department)'

💡 **Pro Tips:**
- Auto-loads all departments on page load
- Search by department name for quick lookup
- Main departments auto-expanded by default
- Indentation shows parent-child relationships
- Print shows flattened view with indentation
- Excel export includes hierarchical structure`,
   },

   user_list: {
      keywords: [
         'user list',
         'how to make user list',
         'user report',
         'user listing',
         'user master list',
         'user register',
         'user details',
         'list of users',
      ],
      response: `📋 **User List - Quick Guide:**

1. Go to Reports → Listing → User List
2. Sr. No. - Serial number
3. User Name - Full name of the user
4. Email - User's email address
5. Mobile - User's mobile number
6. Role - User role/designation
7. Status - Account status badge (Active/Inactive)
8. Last Login - Date and time of last login
9. Export to Excel
10. Print Report

🔗 **Click here to go:** '[Go to user list →](/reports/listing/user)'

💡 **Pro Tips:**
- Auto-loads all users on page load
- Search by any field for quick lookup
- Status badges show account activity
- Last login helps track user activity
- Print shows all filtered data
- Excel export includes all columns`,
   },

   challan_type_list: {
      keywords: [
         'challan type list',
         'how to make challan',
         'challan type report',
         'challan type listing',
         'challan type master list',
         'challan type register',
         'challan type details',
         'list of challan types',
      ],
      response: `📋 **Challan Type List - Quick Guide:**

1. Go to Reports → Listing → Challan Type List
2. S.No. - Serial number
3. Challan Code - Unique challan type code/identifier
4. Challan Name - Name of the challan type
5. Export to Excel
6. Print Report

🔗 **Click here to go:** '[Go to challan type list →](/reports/master-reports/challan-type-report)'

💡 **Pro Tips:**
- Auto-loads all challan types on page load
- Search by code or name for quick lookup
- Print shows all filtered data
- Excel export includes formatted columns
- Status column removed for cleaner display

`,
   },

   //settings/profile-management

   organization_profile: {
      keywords: [
         'organization profile',
         'org profile',
         'create organization profile',
         'edit organization profile',
         'update organization profile',
         'manage organization profile',
         'organization settings',
         'org settings',
         'profile management',
      ],
      response: `📋 **Organization Profile - Quick Guide:**

1. Go to [Settings → Profile Management → Organization Profile]
2. Organization Name
   - Enter full organization name
3. Organization Code
   - Unique organization identifier
   - Auto-generated from name
4. Short Name
   - Abbreviated name
5. Organization Logo
   - Click Upload Logo button
   - Supported formats: JPEG, JPG, PNG, WEBP
6. Address
   - Complete organization address
7. City
   - City name
8. State
   - State name
9. PIN Code
   - Postal/PIN code
10. Email Address
    - Official organization email
11. Mobile Number
    - Contact mobile number
12. Website URL
    - Organization website
13. GST Number
    - GST identification number
14. PAN Number
    - PAN card number
15. TDS Number
    - TDS/TAN number
16. Status Toggle
    - Active - Organization is operational
    - Inactive - Organization is not in use

🔗 **Click here to go:** '[Go to organization profile →](/settings/profile-management/organization-profile)'   

💡 **Pro Tips:**
- Organization Name is mandatory and auto-generates code
- All tax numbers are auto-uppercase for consistency
- Logo supports multiple image formats
- Status toggle controls organization availability
- Copy buttons make sharing details easy
- Reload to fetch latest data from server`,
   },

   branch_profile: {
      keywords: [
         'branch profile',
         'branch management',
         'create branch',
         'edit branch',
         'update branch',
         'delete branch',
         'manage branch',
         'branch settings',
         'branch details',
         'add new branch',
      ],
      response: `📋 **Branch Profile - Quick Guide:**

1. Go to Settings → Profile Management → Branch Profile
2. Branch Selector
   - Click dropdown to view all branches
   - Shows branch name and code
3. Add New Branch
   - Click Add New Branch in dropdown
4. Delete Branch
   - Click Delete Branch
5. Branch Name
   - Enter full branch name
6. Branch Code
   - Unique branch identifier
7. Branch Logo
   - Click Upload Logo
   - Supported formats: JPEG, JPG, PNG, WEBP
8. Address
   - Complete branch address
9. City
   - City name
10. State
    - State name
11. PIN Code
12. Email Address
    - Branch official email
13. Mobile Number
    - Contact mobile number
14. Website URL
    - Branch website
15. GST Number
    - GST identification number
16. PAN Number
    - PAN card number
17. TDS Number
    - TDS/TAN number
18. Status Toggle
    - Active - Branch is operational
    - Inactive - Branch is not in use

🔗 **Click here to go:** '[Go to branch profile →](/settings/profile-management/branch-profile)'

💡 **Pro Tips:**
- Branch Name is mandatory and auto-generates code
- Multiple branches can be managed under one organization
- Branch selector shows all branches with codes
- Delete is soft-delete (reversible)
- All tax numbers are auto-uppercase for consistency
- Logo supports multiple image formats
- Status toggle controls branch availability
- Copy buttons make sharing details easy`,
   },

   action_master: {
      keywords: [
         'action master',
         'action master view',
         'action details',
         'view action',
         'action master details',
         'action information',
         'action master record',
         'workflow action view',
      ],
      response: `📋 **View Action Master - Quick Guide:**

1. Go to Settings → Profile Management → Action Master
2. Click on any action record to view details
3. Department - Department associated with the action
4. Stage - Workflow stage of the action
5. Status Name - Current status name
6. Is Forward - Indicates if forward is allowed (Yes/No)
7. Viewers List
    - Designation name and ID
8. Bank Select
9. Account Voucher Number Generate 
10.Enter Remarks (Optional)
11. Add Action
12. Print Report
    - Click Print Report button
    
🔗 **Click here to go:** '[Go to view action master →](/settings/profile-management/action-master)

💡 **Pro Tips:**
- Previous Status shows the referenced action details
- Authorities can have multiple departments
- Viewers can view but not approve actions
- Copy icons make sharing details easy
- View Previous Action link for quick navigation
- Print report includes all sections for documentation`,
   },

   financial_year_master: {
      keywords: [
         'financial year master',
         'create financial year',
         'add financial year',
         'edit financial year',
         'update financial year',
         'delete financial year',
         'manage financial year',
         'financial year management',
         'financial year list',
         'view financial year',
         'financial year',
      ],
      response: `📋 **Financial Year Master - Quick Guide:**

1. Go toSettings → Profile Management → Financial Year Master
2. Click Add New Financial Year button
3. Enter Financial Year Code
4. Enter Financial Year Name
5. Start Date Auto-calculated
6. End Date
   
7. Previous Financial Year
   - Select from dropdown of existing years
8. Next Financial Year
   - Select from dropdown of existing years
9. Status
   - ACTIVE - Year is currently in use
   - CLOSED - Year is completed
   - LOCKED - Year is locked for changes
10. Remarks
    - Additional notes about the financial year
11. Current Year
    -ON - Mark as current financial year (Yellow)
    -OFF - Not current (Gray)
12. Transactions Open
    - ON - Allows financial transactions (Blue)
    - OFF - Transactions are closed (Red)
13. Click Update Financial Year
14. Click Confirm to save changes
15. Export to Excel - Download list as Excel file
16. Print Report - Print the financial year 

🔗 **Click here to go:** '[Go to financial year master →](/settings/profile-management/financial-year-master)'

💡 **Pro Tips:**
- FY Code format must be YYYY-YY (e.g., 2024-25)
- Start Date and End Date are auto-calculated and read-only
- Only one year should be marked as "Current"
- Budget and Transaction toggles control system access
- Previous/Next year links create a chain of financial years
- Deleted years cannot be recovered`,
   },

   user_master: {
      keywords: [
         'user master',
         'create user',
         'add user',
         'edit user',
         'update user',
         'delete user',
         'manage user',
         'user management',
         'user list',
         'view user',
         'user',
      ],
      response: `📋 **User Master - Quick Guide:**

1. Go to Settings → User Management → User Master
2. Click Add New User button
3. Enter Username
4. Enter Email Address
   - Valid email format required
5. Enter Mobile Number
6. Select Role
   - Click dropdown to search roles
7. Generate Password
   - Click Generate Password button
8. Enter Password
   - Minimum 6 characters
9.Confirm Password
   - Re-enter password to confirm
10. Click Update User
11. Click Confirm to save changes

🔗 **Click here to go:** '[Go to user master →](/settings/user-management/user-master)'

💡 **Pro Tips:**
- Username, Email, and Mobile are required and must be unique
- Role is optional - users can have no role assigned
- Generated password is secure and meets all requirements
- Password fields are optional in Edit mode (leave empty to keep current)
- Real-time password match indicator helps prevent typos
- Role dropdown is searchable for quick selection`,
   },

   user_department_mapping: {
      keywords: [
         'user department mapping',
         'user department mapping',
         'assign user to department',
         'map user department',
         'user department assignment',
         'department mapping',
         'user department relation',
         'user department management',
      ],
      response: `📋 **User-Department Mapping - Quick Guide:**

1. Go to Settings → User Management → User-Department Mapping
2. Click Add New Mapping button
3. Select User
   - Click dropdown to search users
   - Shows user name, email, and mobile
4. Select Department
   - Click dropdown to search departments
5. Click Create Mapping button
6. Confirmation dialog with mapping details
7. Click Yes, create to confirm

🔗 **Click here to go:** '[Go to user department mapping →](/settings/user-management/user-department-mapping)'

💡 **Pro Tips:**
- A user can be mapped to multiple departments
- Department selection supports multi-select
- Search users by name, email, or mobile
- Search departments by name or code
- Edit mode shows change detection
- Confirmation dialog shows summary of changes
- Clear selection buttons for quick reset
- Badges show selected departments`,
   },

   //settings/edp-management/configuration/system-parameters

   system_parameters: {
      keywords: [
         'system parameters',
         'system settings',
         'application settings',
         'configuration',
         'system configuration',
         'date format settings',
         'time format settings',
         'currency settings',
         'alignment settings',
         'database settings',
         'system preferences',
         'app settings',
      ],
      response: `📋 **System Parameters - Quick Guide:**

1. Go to Settings → EDP Management → Configuration → System Parameters
2. Date Format
   - Select from multiple date formats
3.Time Format
   - 12 Hour
   - 24 Hour
4. Currency Format
   - Indian Format (INR) - Uses lakhs and crores
     - Example: ₹ 1,72,25,41,922.69
   - US/International Format (USD)
     - Example: $ 1,722,541,922.69

5. Default Amount Value
   - Default amount for new records
   
6. Amount Field Alignment
   - Left Align - Align amounts to left
   - Center Align - Center amounts
   - Right Align - Align amounts to right

7. Text Field Alignment
   - Left Align - Align text to left
   - Center Align - Center text
   - Right Align- Align text to right

8. Database Row Limit
   - Number of rows per page in tables
   - Options: 25, 50, 75, 100 rows
   - Applies to all data tables

🔗 **Click here to go:** '[Go to System Parameters →](/settings/edp-management/configuration/system-parameters)'

💡 **Pro Tips:**
- Date format preview shows sample with current date
- Currency format dropdown shows example values
- Amount field supports up to 13 digits with 2 decimals
- Row limit affects all data tables performance
- Reset to Defaults is irreversible (confirmation required)
- Inactive settings are disabled but preserved`,
   },

   view_gen_voucher_master: {
      keywords: [
         'view generate voucher master',
         'voucher master view',
         'generate voucher master details',
         'view voucher configuration',
         'voucher prefix details',
         'voucher format view',
         'voucher master record',
         'voucher configuration details',
      ],
      response: `📋 **View Generate Voucher Master - Quick Guide:**

1. Go to Settings → EDP Management → Configuration → Generate Voucher Master

2. Prefix - Voucher prefix (e.g., INV, PUR, SAL, JOU)
3. Include Department - Shows Yes/No with Green/Gray badge
4. Text - Additional text in voucher number (Optional)
5. No Series - Numbering series type
   - Department Series - Sequential per department
   - AMT Series - Global sequential numbering

6. Include Financial Year - Shows Yes/No with Green/Gray badge
7. Voucher Format - Preview of complete voucher format
8. Separators - Characters between parts
   - After Prefix - Separator after prefix
   - After Dept - Separator after department
9. Active Status - Shows Active/Inactive badge

🔗 **Click here to go:** '[Go to voucher nummbering setup →](/settings/edp-management/configuration/generate-voucher-master/)'

💡 **Pro Tips:**
- Voucher format preview shows the actual numbering pattern
- Department and FY inclusion affects voucher uniqueness
- Separators can be customized per part
- Active status controls if voucher can be used
- Prefix and Text are combined to create the voucher number`,
   },

   menu_master: {
      keywords: [
         'menu master',
         'menu management',
         'create menu item',
         'add menu item',
         'edit menu item',
         'delete menu item',
         'manage menus',
         'menu hierarchy',
         'menu configuration',
      ],
      response: `📋 **Menu Master - Quick Guide:**

1. Go to Settings → EDP Management → Configuration → Menu Master
2. Total Menu Items - Overall menu count

3. Click Add Menu Item button
4. Parent Menu Item
    - Select parent from dropdown
5. Description
    - Display name for the menu item
6. Action
    - Click dropdown to search actions
7. Quick Action
8. Page Title
9. Page Content
10. Menu Links
11. Mode Code
12. Generate Voucher
13. Click Create Menu Item

🔗 **Click here to go:** '[Go to menu master →](/settings/menu-management/menu-master)'

💡 **Pro Tips:**
- Level 1 menus expand to show children
- Actions are filtered to those with Previous_Status = null
- Quick Actions appear in the Quick Actions section
- Visibility toggle controls menu display
- Rich text editor supports HTML content
- Parent menu determines hierarchy level
- Gen Voucher formats auto-associate with menu`,
   },

   // ============================================
   // 7️⃣ CHEQUE PRINTING ENTRIES
   // ============================================

   cheque_printing: {
      keywords: [
         'cheque',
         'print cheque',
         'cheque print',
         'cheque printing',
         'how to print cheque',
         'print check',
         'cheque format',
         'cheque layout',
         'cheque design',
         'bank cheque',
         'cheque paper',
         'cheque printer',
         'cheque settings',
         'sbi cheque',
         'kotak cheque',
         'hdfc cheque',
      ],
      response: `📄 **How to Print a Cheque:**

1. Go to **Transactions → Bookkeeping Vouchers → Payment Entries**
2. Select the Payment Voucher
3. Click on **Print Cheque** button

**Cheque Details to Fill:**
- Bank Name (SBI, Kotak, HDFC)
- Payee Name
- Amount (in figures & words)
- Cheque Date
- Cheque Type (A/c Payee / Bearer / Self)

**Cheque Layout Options:**
- SBI Format - DDMMYYYY (no spaces)
- KOTAK Format - DD MM YYYY (with spaces)
- HDFC Format - Standard HDFC layout

**Pro Tips:**
- ✅ Insert cheque paper vertically
- ✅ Preview before printing
- ✅ Check printer alignment

🎤 **Voice Command:** Say "print cheque" to get this guide

🔹 **Need help? Click "📞 Call Expert" for assistance!**`,
   },

   cheque_banks: {
      keywords: [
         'sbi cheque',
         'kotak cheque',
         'hdfc cheque',
         'bank cheque',
         'cheque layout bank',
         'state bank cheque',
      ],
      response: `🏦 **Supported Banks for Cheque Printing**

| Bank | Layout | Date Format |
|------|--------|-------------|
| SBI | Standard SBI | DDMMYYYY |
| KOTAK | Standard Kotak | DD MM YYYY |
| HDFC | Standard HDFC | DD/MM/YYYY |

**How to Select Bank:**
1. Go to Cheque Printing page
2. Click Bank Selector dropdown
3. Choose your bank

🎤 **Voice Command:** Say "cheque format" to see this list

🔹 **Click "📞 Call Expert" for bank setup assistance!**`,
   },

   cheque_issues: {
      keywords: [
         'cheque issue',
         'cheque problem',
         'cheque error',
         'cheque not printing',
         'cheque alignment',
      ],
      response: `⚠️ **Cheque Printing Issues - Troubleshooting**

**Common Issues & Solutions:**

1. **Misalignment** → Adjust Top/Left Offset (mm)
2. **Text Cut Off** → Reduce font size, adjust margins
3. **Blurry Text** → Check printer quality, clean heads
4. **Paper Jam** → Insert vertically, use single sheet

**Quick Fix Checklist:**
- [ ] Insert cheque vertically
- [ ] Check printer is on
- [ ] Verify cheque size (8×3.66 inches)
- [ ] Preview before printing

🎤 **Voice Command:** Say "cheque problem" for this guide

🔹 **Click "📞 Call Expert" for immediate help!**`,
   },

   cheque_sample: {
      keywords: [
         'sample cheque',
         'cheque example',
         'cheque filling',
         'how to fill cheque',
         'cheque template',
      ],
      response: `📋 **Sample Cheque Filling**

**Cheque Details:**
\`\`\`
Payee Name:     M/s ABC Traders Pvt. Ltd.
Amount:         ₹ 1,50,000.00
Amount Words:   One Lakh Fifty Thousand Only
Date:           24/02/2025
Cheque Type:    A/c Payee
Bank:           SBI
\`\`\`

**How to Fill:**
1. **Date** - Write DD/MM/YYYY
2. **Payee** - Write company/person name clearly
3. **Amount in Words** - Write in words, end with "Only"
4. **Amount in Figures** - Write ₹ 1,50,000.00
5. **Signature** - Sign as per bank records

🎤 **Voice Command:** Say "cheque sample" to see this

🔹 **Need help? Click "📞 Call Expert"!**`,
   },

   // ============================================
   // 8️⃣ CALL EXPERT ENTRIES (UPDATED with Daily.co)
   // ============================================

   call_expert: {
      keywords: [
         'call',
         'call expert',
         'talk to expert',
         'speak to expert',
         'contact expert',
         'expert help',
         'expert assistance',
         'help me',
         'i need help',
      ],
      response: `📞 **Connecting to Expert via Daily.co...**

I'm connecting you to a support expert right now!

**Available Expert Services:**
1. Technical Support - System issues
2. Financial Expert - Accounting queries
3. HR Expert - Employee management
4. Tender Expert - Tender management

**How to Connect:**
1. Say **"call expert"** or **"talk to expert"** 🎤
2. Your Daily.co voice call will start automatically
3. Share your query with the expert

🔄 **Alternative Methods:**
• 📧 Email: support@your-company.com
• 💬 Live Chat: Available on website

🎤 **Voice Command:** Say "call expert" to connect immediately`,
   },

   call_emergency: {
      keywords: [
         'emergency',
         'urgent',
         'critical',
         'immediate help',
         'urgent help',
         'emergency call',
         'system down',
         'need urgent help',
      ],
      response: `🚨 **EMERGENCY CALL via Daily.co!**

⚠️ **Priority Assistance:**

I'm connecting you to the emergency response team NOW!

1. Say **"emergency"** or **"urgent"** 🎤
2. Your Daily.co emergency call will start automatically
3. Priority queue - No waiting time
4. 24/7 Emergency support available

**Emergency Contact:**
• 📞 Hotline: +91-XXXXXXXXXX
• 📧 Email: emergency@your-company.com
• 💬 WhatsApp: +91-XXXXXXXXXX

🎤 **Voice Command:** Say "emergency" for priority help`,
   },

   // ✅ ADD DAILY.CO VOICE COMMANDS HELP
   voice_commands: {
      keywords: [
         'voice command',
         'voice commands',
         'speech command',
         'speech commands',
         'voice help',
         'command list',
      ],
      response: `🎤 **Voice Commands for Daily.co Calls:**

| Say This | Action |
|----------|--------|
| "call expert" | 📞 Start a voice call with an expert |
| "talk to expert" | 📞 Connect to an expert |
| "help me" | 📞 Get help from an expert |
| "emergency" | 🚨 Start an emergency call |
| "urgent" | 🚨 Emergency support |
| "stop" | ⏹️ Stop voice recognition |
| "help" | 📖 Show this help menu |

🎤 Just say these commands anytime!`,
   },

}; // END OF knowledgeBase

// ============================================
// 9️⃣ QUICK SUGGESTIONS (UPDATED)
// ============================================

const quickSuggestions = [
   // YOUR EXISTING SUGGESTIONS
   { label: '📄 Create Bill', query: 'How to create a bill?' },
   { label: '📊 Trial Balance', query: 'How to generate trial balance?' },
   { label: '👤 Edit Profile', query: 'How to edit my profile?' },
   { label: '🏖️ Apply Leave', query: 'How to apply for leave?' },
   { label: '🏛️ Book Hall', query: 'How to book a hall?' },
   { label: '📈 Reports', query: 'What reports are available?' },
   { label: '❓ Help', query: 'help' },
   { label: '🏪 Book Shop', query: 'How to book a shop?' },
   { label: '👥 Employees', query: 'How to manage employees?' },
   // NEW CHEQUE SUGGESTIONS
   { label: '🖨️ Print Cheque', query: 'How to print a cheque?' },
   { label: '📋 Cheque Sample', query: 'Show me a cheque sample' },
   { label: '🏦 Cheque Banks', query: 'Which banks are supported for cheque printing?' },
   // ✅ ADD THESE VOICE CALL SUGGESTIONS
   { label: '📞 Call Expert', query: 'call expert' },
   { label: '🚨 Emergency', query: 'emergency' },
   { label: '🎤 Voice Help', query: 'voice commands' },
   { label: '⏹️ End Call', query: 'end call' },
   { label: '📊 Call Status', query: 'call status' },
];

// ============================================
// 🔟 FIND RELEVANT KNOWLEDGE FUNCTION (UPDATED)
// ============================================
const findRelevantKnowledge = (query) => {
   // Safety check
   if (!query || typeof query != 'string') {
      return knowledgeBase.help?.response || "I'm here to help! Please ask me a specific question.";
   }

   const lowerQuery = query.toLowerCase();

   // ✅ ADD THESE VOICE CALL CHECKS AT THE BEGINNING
   if (lowerQuery.includes('end call') || lowerQuery.includes('hang up')) {
      return `⏹️ **Ending Voice Call...**

I'm disconnecting your current call.

🎤 Say **"call expert"** to start a new call
🎤 Say **"emergency"** for priority support
🎤 Say **"call status"** to check if a call is active`;
   }

   if (lowerQuery.includes('call status') || lowerQuery.includes('is call active')) {
      const active = isVoiceCallActive();
      const state = getCurrentVoiceCallState();
      if (active && state) {
         const type = state.type == 'emergency' ? '🚨 Emergency' : '📞 Expert';
         return `📊 **Call Status: Active**

${type} call in progress
📱 Room: ${state.roomName}
🕐 Started: ${new Date(state.startedAt).toLocaleTimeString()}

🎤 Say **"end call"** to disconnect
🎤 Say **"emergency"** for priority support`;
      }
      return `📊 **Call Status: No Active Call**

No voice call is currently active.

🎤 Say **"call expert"** to start a call
🎤 Say **"emergency"** for priority support
🎤 Say **"voice commands"** to see all options`;
   }

   if (lowerQuery.includes('voice') && lowerQuery.includes('command')) {
      return getVoiceCallHelp() || getDailyCoVoiceHelp();
   }

   if (
      lowerQuery.includes('call expert') ||
      lowerQuery.includes('talk to expert') ||
      lowerQuery.includes('help me')
   ) {
      return '📞 Connecting you to an expert via Daily.co...';
   }

   if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent') || lowerQuery.includes('critical')) {
      return '🚨 Emergency call via Daily.co initiated!';
   }

   // Check for cheque query
   const chequeKeywords = [
      'cheque',
      'check',
      'print cheque',
      'cheque print',
      'cheque printing',
      'cheque format',
      'cheque layout',
      'cheque bank',
      'sbi cheque',
      'kotak cheque',
      'hdfc cheque',
   ];
   if (chequeKeywords.some((kw) => lowerQuery.includes(kw))) {
      if (lowerQuery.includes('sbi') || lowerQuery.includes('kotak') || lowerQuery.includes('hdfc')) {
         return knowledgeBase.cheque_banks?.response || '🏦 Let me show you the bank layouts.';
      }
      if (lowerQuery.includes('issue') || lowerQuery.includes('problem') || lowerQuery.includes('error')) {
         return knowledgeBase.cheque_issues?.response || '⚠️ Let me help you troubleshoot.';
      }
      if (lowerQuery.includes('sample') || lowerQuery.includes('example') || lowerQuery.includes('fill')) {
         return knowledgeBase.cheque_sample?.response || '📋 Here\'s a sample cheque.';
      }
      return knowledgeBase.cheque_printing?.response || '📄 I can help you with cheque printing.';
   }

   // Check for call query (legacy)
   const callKeywords = ['call', 'expert', 'talk', 'speak', 'help', 'support', 'emergency', 'urgent'];
   if (callKeywords.some((kw) => lowerQuery.includes(kw))) {
      if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent')) {
         return knowledgeBase.call_emergency?.response || '🚨 Emergency support is available.';
      }
      return knowledgeBase.call_expert?.response || '📞 Would you like to connect with an expert?';
   }

   // Search knowledge base
   let bestMatch = null;
   let highestScore = 0;

   if (!knowledgeBase || typeof knowledgeBase != 'object') {
      return "I'm having trouble accessing my knowledge base. Please try again later.";
   }

   for (const [key, entry] of Object.entries(knowledgeBase)) {
      if (!entry || typeof entry != 'object') continue;
      if (!entry.keywords || !Array.isArray(entry.keywords)) continue;

      for (const keyword of entry.keywords) {
         if (!keyword || typeof keyword != 'string') continue;
         const keywordLower = keyword.toLowerCase();
         if (lowerQuery.includes(keywordLower)) {
            const score = keyword.length / lowerQuery.length;
            if (score > highestScore) {
               highestScore = score;
               bestMatch = entry.response;
            }
         }
      }
   }

   if (!bestMatch && (lowerQuery.includes('how') || lowerQuery.includes('help') || lowerQuery.includes('guide') || lowerQuery.includes('what'))) {
      return knowledgeBase.help?.response || "I'm here to help! Please ask me a specific question.";
   }

   if (!bestMatch) {
      return (
         "I couldn't find specific information about that. Please try asking about:\n\n" +
         '• How to create a bill\n' +
         '• How to generate a trial balance\n' +
         '• How to edit your profile\n' +
         '• How to apply for leave\n' +
         '• How to register a pet\n' +
         '• How to book a hall\n' +
         '• How to print a cheque\n' +
         "• How to call an expert (say 'call expert')\n" +
         "• Voice commands (say 'voice commands')"
      );
   }

   return bestMatch;
};

// ============================================
// 1️⃣1️⃣ HELPER FUNCTIONS
// ============================================

const getAllKeywords = () => {
   const allKeywords = [];

   if (!knowledgeBase || typeof knowledgeBase != 'object') {
      return allKeywords;
   }

   for (const [key, entry] of Object.entries(knowledgeBase)) {
      if (!entry || typeof entry != 'object' || !entry.keywords || !Array.isArray(entry.keywords)) {
         continue;
      }

      const validKeywords = entry.keywords.filter((kw) => kw && typeof kw == 'string');
      allKeywords.push(...validKeywords);
   }

   return allKeywords;
};

const getModuleNames = () => {
   const moduleNames = [];

   if (!knowledgeBase || typeof knowledgeBase != 'object') {
      return moduleNames;
   }
   const moduleMap = {
      bill_creation: 'Billing',
      trial_balance: 'Financial Reports',
      profile_edit: 'Profile Management',
      hrms_leave: 'Leave Management',
      hall_booking: 'Hall Booking',
      dashboard: 'Dashboard',
      transaction: 'Transactions',
      report: 'Reports',
      help: 'Help',
      shop_booking: 'Shop Booking',
      employee_management: 'Employee Management',
      cheque_printing: 'Cheque Printing',
      cheque_banks: 'Bank Layouts',
      cheque_issues: 'Cheque Troubleshooting',
      cheque_sample: 'Cheque Sample',
      call_expert: 'Call Expert',
      call_emergency: 'Emergency Support',
      voice_commands: 'Voice Commands',
      daily_co_voice: 'Daily.co Voice',
   };

   for (const [key, entry] of Object.entries(knowledgeBase)) {
      if (!entry || typeof entry != 'object') continue;

      moduleNames.push({
         key: key,
         name: moduleMap[key] || key.replace(/_/g, ' ').toUpperCase(),
         keywords: entry.keywords && Array.isArray(entry.keywords) ? entry.keywords.filter((kw) => kw && typeof kw == 'string') : [],
      });
   }

   return moduleNames;
};

// ============================================
// ✅ ADD THESE VOICE CALL FUNCTIONS HERE
// ============================================

/**
 * Check if browser supports audio for calls
 */
const isAudioSupported = () => {
   return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Get Daily.co room URL for voice calls
 */
const getVoiceCallRoomUrl = (roomName = null, type = 'normal') => {
   const domain = voiceConfig.dailyCo?.domain || 'your-domain.daily.co';
   const room = roomName || `voice-support-room-${Date.now()}`;
   const baseUrl = `https://${domain}/${room}`;
   if (type == 'emergency') {
      return `${baseUrl}?emergency=true&priority=high`;
   }
   return baseUrl;
};

/**
 * Start a voice call via Daily.co
 */
const startVoiceCall = async (type = 'normal', options = {}) => {
   try {
      if (!isDailyCoEnabled()) {
         return { success: false, error: 'Daily.co is not configured.' };
      }
      if (!isAudioSupported()) {
         return { success: false, error: 'Your browser does not support audio calls.' };
      }
      const roomName = options.roomName || `voice-support-room-${Date.now()}`;
      const roomUrl = getVoiceCallRoomUrl(roomName, type);
      const callState = {
         roomUrl,
         roomName,
         type,
         startedAt: new Date().toISOString(),
         status: 'initiated',
      };
      if (typeof window != 'undefined') {
         sessionStorage.setItem('dailyCoCallState', JSON.stringify(callState));
         return {
            success: true,
            roomUrl,
            roomName,
            type,
            message: type == 'emergency'
               ? '🚨 Emergency call initiated! Connecting to priority support...'
               : '📞 Connecting you to an expert via Daily.co...',
            callState,
         };
      }
      return { success: true, roomUrl, roomName, type, callState };
   } catch (error) {
      console.error('❌ Failed to start voice call:', error);
      return { success: false, error: error.message || 'Failed to start voice call' };
   }
};

/**
 * End the current voice call
 */
const endVoiceCall = async (roomName = null) => {
   try {
      const callState = sessionStorage.getItem('dailyCoCallState');
      if (callState) {
         const parsed = JSON.parse(callState);
         sessionStorage.removeItem('dailyCoCallState');
         console.log(`✅ Ended voice call for room: ${parsed.roomName || roomName || 'unknown'}`);
      }
      return true;
   } catch (error) {
      console.error('❌ Failed to end voice call:', error);
      return false;
   }
};

/**
 * Get current voice call state
 */
const getCurrentVoiceCallState = () => {
   try {
      const callState = sessionStorage.getItem('dailyCoCallState');
      if (callState) {
         return JSON.parse(callState);
      }
      return null;
   } catch (error) {
      console.error('❌ Failed to get call state:', error);
      return null;
   }
};

/**
 * Check if an active voice call is in progress
 */
const isVoiceCallActive = () => {
   const state = getCurrentVoiceCallState();
   if (!state) return false;
   const startedAt = new Date(state.startedAt);
   const now = new Date();
   const diffMinutes = (now - startedAt) / (1000 * 60);
   return diffMinutes < 60;
};

/**
 * Get voice call help message
 */
const getVoiceCallHelp = () => {
   return `🎤 **Voice Call Commands:**

| Say This | Action |
|----------|--------|
| "call expert" | 📞 Start a normal support call |
| "talk to expert" | 📞 Connect to an expert |
| "help me" | 📞 Get help from support |
| "emergency" | 🚨 Start priority emergency call |
| "urgent" | 🚨 Emergency support |
| "critical" | 🚨 Critical priority support |
| "end call" | ⏹️ End current call |
| "hang up" | ⏹️ Disconnect call |
| "call status" | 📊 Check if call is active |
| "stop" | 🛑 Stop voice recognition |

**How it works:**
1. 🎤 Say any command above
2. 📞 Daily.co call will start automatically
3. 🚨 Emergency calls get priority queue
4. ⏹️ Say "end call" to disconnect

**Need immediate help?** Say **"emergency"** for priority support!`;
};

/**
 * Initiate a normal expert call
 */
const initiateExpertCall = async (type = 'normal') => {
   return await startVoiceCall(type);
};

/**
 * Initiate an emergency call
 */
const initiateEmergencyCall = async () => {
   return await startVoiceCall('emergency');
};

export {
   voiceConfig,
   SpeechRecognizer,
   TextToSpeech,
   VoiceAssistant,
   getVoiceAssistant,
   isVoiceSupported,
   getVoiceCommands,
   speakResponse,
   getVoiceCommandHelp,
   knowledgeBase,
   quickSuggestions,
   findRelevantKnowledge,
   getAllKeywords,
   getModuleNames,
   isDailyCoEnabled,
   getDailyCoConfig,
   getDailyCoDomain,
   getDailyCoRoomUrl,
   getDailyCoVoiceHelp,
   createDailyCoRoom,
   checkDailyCoHealth,
   // ✅ ADD THESE MISSING EXPORTS
   isAudioSupported,
   getVoiceCallRoomUrl,
   startVoiceCall,
   endVoiceCall,
   getCurrentVoiceCallState,
   isVoiceCallActive,
   getVoiceCallHelp,
   initiateExpertCall,
   initiateEmergencyCall,
   //SUPPORTED_LANGUAGES,
   getLanguage,
   setLanguage,
   getSupportedLanguages,
   getLanguageInstruction,
};
