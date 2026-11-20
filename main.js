/**
 * Landing page behaviour: SMS simulator, staff demo panel, voice advice player
 * and the "Open the app" overlay. Everything here is a demo that runs in the
 * visitor's browser; nothing is sent to a real phone or server.
 */
(function (global) {
  "use strict";

  const { data, menu } = global.AgriCare;
  const byId = (id) => document.getElementById(id);

  const VOICE_URL = "voice-advice.mp3";
  const APP_URL = "app.html";
  const PLANTING_PROMPT = "Which crop?"; // option 1 of the menu offers voice advice

  // ---------- SMS gateway (in-memory stand-in for a real backend) ----------

  class SmsGateway {
    constructor() {
      this.subscribers = [];
      this.helpRequests = [];
      this.foodChecks = 0;
      this.sessions = new Map(); // phone -> { inputs: string[] }
    }

    /** Returns the reply to an incoming message from `phone`. */
    handle(phone, rawText) {
      const text = String(rawText || "").trim();

      if (/^stop$/i.test(text)) {
        this.unsubscribe(phone);
        this.sessions.delete(phone);
        return `You are unsubscribed from AgriCare-Liberia advisories. Text ${menu.SHORT_CODE} for the menu.`;
      }

      if (text === menu.SHORT_CODE || /^(menu|start|hi|hello)$/i.test(text)) {
        this.sessions.set(phone, { inputs: [] });
        return menu.run([], this.hooksFor(phone)).text;
      }

      const session = this.sessions.get(phone);
      if (!session) return `Welcome to AgriCare-Liberia. Text ${menu.SHORT_CODE} for the menu.`;

      session.inputs.push(text);
      const result = menu.run(session.inputs, this.hooksFor(phone));
      if (result.end) this.sessions.delete(phone);
      return result.text;
    }

    countSubscribers(county) {
      return this.subscribers.filter((s) => !county || s.county === county).length;
    }

    unsubscribe(phone) {
      this.subscribers = this.subscribers.filter((s) => s.phone !== phone);
    }

    hooksFor(phone) {
      return {
        onJoin: (county) => {
          this.unsubscribe(phone);
          this.subscribers.push({ phone, county });
        },
        onHelp: (issue) => this.helpRequests.unshift({ phone, issue }),
        onFoodCheck: () => {
          this.foodChecks += 1;
        },
      };
    }
  }

  // ---------- voice advice player ----------

  class VoicePlayer {
    constructor(url) {
      this.url = url;
      this.audio = null;
    }

    get isPlaying() {
      return Boolean(this.audio) && !this.audio.paused && !this.audio.ended;
    }

    ensureAudio() {
      if (!this.audio) {
        this.audio = new Audio(this.url);
        this.audio.preload = "auto";
        ["play", "pause", "ended"].forEach((type) =>
          this.audio.addEventListener(type, () => this.syncButtons())
        );
      }
      return this.audio;
    }

    play() {
      const audio = this.ensureAudio();
      audio.currentTime = 0;
      return audio.play().then(() => this.syncButtons(), () => {});
    }

    toggle() {
      if (this.isPlaying) {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.syncButtons();
      } else {
        this.play();
      }
    }

    /** Keeps every voice button's label and pressed state in step with playback. */
    syncButtons() {
      const playing = this.isPlaying;
      document.querySelectorAll(".voice-btn").forEach((button) => {
        button.setAttribute("aria-pressed", String(playing));
        button.textContent = playing ? "\u23F9 Stop voice advice" : button.dataset.idleLabel;
      });
    }

    /** Creates a button wired to this player. */
    createButton(idleLabel) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn--gold voice-btn";
      button.dataset.idleLabel = idleLabel;
      button.setAttribute("aria-pressed", "false");
      button.textContent = idleLabel;
      button.addEventListener("click", () => this.toggle());
      return button;
    }
  }

  // ---------- SMS chat simulator ----------

  class ChatSimulator {
    constructor({ gateway, voice, phone = "web" }) {
      this.gateway = gateway;
      this.voice = voice;
      this.phone = phone;
      this.log = byId("chat-log");
      this.input = byId("chat-input");

      byId("chat-send").addEventListener("click", () => this.send());
      this.input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") this.send();
      });
      this.append("Text 2323 to start.", "bot");
    }

    append(text, kind) {
      const bubble = document.createElement("div");
      bubble.className = `msg msg--${kind}`;
      bubble.textContent = text;
      this.log.appendChild(bubble);
      this.scrollToEnd();
      return bubble;
    }

    appendVoiceCard() {
      const card = document.createElement("div");
      card.className = "msg msg--bot msg--voice";

      const caption = document.createElement("span");
      caption.textContent = "Voice advice for farmers who cannot read";
      card.append(caption, this.voice.createButton("\uD83D\uDD0A Listen to voice advice"));

      this.log.appendChild(card);
      this.scrollToEnd();
      this.voice.play();
    }

    send() {
      const text = this.input.value.trim();
      if (!text) return;
      this.input.value = "";

      this.append(text, "user");
      const reply = this.gateway.handle(this.phone, text) || "(no reply)";
      this.append(reply, "bot");
      if (reply.startsWith(PLANTING_PROMPT)) this.appendVoiceCard();
    }

    scrollToEnd() {
      this.log.scrollTop = this.log.scrollHeight;
    }
  }

  // ---------- staff demo panel ----------

  class StaffPanel {
    constructor(gateway) {
      this.gateway = gateway;
      this.county = byId("staff-county");
      this.message = byId("staff-message");
      this.status = byId("staff-status");
      this.stats = byId("staff-stats");

      data.counties.forEach((name) => {
        const option = document.createElement("option");
        option.textContent = name;
        this.county.appendChild(option);
      });

      byId("staff-send").addEventListener("click", () => this.sendAdvisory());
      byId("staff-load").addEventListener("click", () => this.showStats());
    }

    sendAdvisory() {
      if (!this.message.value.trim()) {
        this.status.textContent = "Message is empty";
        return;
      }
      const recipients = this.gateway.countSubscribers(this.county.value);
      this.status.textContent = `Sent to ${recipients} of ${recipients} (demo, not delivered)`;
      this.renderStats();
    }

    showStats() {
      this.status.textContent = "Demo mode: runs in this browser, nothing is sent to a real phone.";
      this.renderStats();
    }

    renderStats() {
      const { subscribers, helpRequests, foodChecks } = this.gateway;
      // Only numbers are interpolated here, so innerHTML is safe.
      this.stats.innerHTML =
        `<p><b>${subscribers.length}</b> subscribers \u00B7 ` +
        `<b>${helpRequests.length}</b> help requests \u00B7 ` +
        `<b>${foodChecks}</b> food checks</p>`;
    }
  }

  // ---------- full-screen app overlay ----------

  class AppOverlay {
    constructor() {
      this.overlay = byId("app-overlay");
      this.frame = byId("app-frame");
      this.opener = null;

      document.querySelectorAll("[data-open-app]").forEach((link) =>
        link.addEventListener("click", (event) => {
          event.preventDefault();
          this.open(link);
        })
      );
      byId("app-close").addEventListener("click", () => this.close());
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !this.overlay.hidden) this.close();
      });
    }

    open(opener) {
      this.opener = opener;
      if (!this.frame.getAttribute("src")) this.frame.src = APP_URL; // load lazily, once
      this.overlay.hidden = false;
      document.body.style.overflow = "hidden";
      byId("app-close").focus();
    }

    close() {
      this.overlay.hidden = true;
      document.body.style.overflow = "";
      if (this.opener) this.opener.focus();
    }
  }

  // ---------- bootstrap ----------

  document.addEventListener("DOMContentLoaded", () => {
    const gateway = new SmsGateway();
    const voice = new VoicePlayer(VOICE_URL);

    new ChatSimulator({ gateway, voice });
    new StaffPanel(gateway);
    new AppOverlay();

    byId("voice-audio").src = VOICE_URL;
    const intro = byId("voice-intro");
    intro.dataset.idleLabel = intro.textContent;
    intro.addEventListener("click", () => voice.toggle());
  });
})(window);
