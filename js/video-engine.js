/**
 * Google Play Launch Studio - Video Promo & Trailer Engine (100% Client-Side)
 * Generates stunning animated video trailers (16:9 YouTube / 9:16 Shorts) using Canvas & MediaRecorder API
 */

class VideoEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animationFrameId = null;
    this.isPlaying = false;
    this.isRecording = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    
    // Audio Synth for royalty-free upbeat background trailer music
    this.audioCtx = null;
    this.audioDestination = null;
  }

  /**
   * Helper: Initialize Web Audio Synth for Video Music Track
   */
  initAudioTrack() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.audioDestination = this.audioCtx.createMediaStreamDestination();
    } catch (e) {
      console.warn("Web Audio not supported for video recording", e);
    }
  }

  /**
   * Play dynamic ambient melodic chime chord during slide transition
   */
  playSlideSound(freq = 440) {
    if (!this.audioCtx || !this.audioDestination) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.audioDestination);
      gain.connect(this.audioCtx.destination); // For real-time listening

      osc.start(now);
      osc.stop(now + 0.85);
    } catch (e) {
      // Ignore audio glitches
    }
  }

  /**
   * Render a single animated video frame
   */
  renderFrame(state, slideIndex, progress, slideDuration) {
    const { width, height, slides, format, transitionEffect, fontFamily = 'Outfit' } = state;
    const currentSlide = slides[slideIndex] || slides[0];
    const nextSlide = slides[(slideIndex + 1) % slides.length];
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    // Easing helpers
    const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOutBack = t => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

    // Transition Window (last 0.25 of slide)
    const transitionWindow = 0.25;
    const isTransitioning = progress > (1 - transitionWindow);
    const transProgress = isTransitioning ? (progress - (1 - transitionWindow)) / transitionWindow : 0;
    const easedTrans = easeInOutCubic(transProgress);

    // 1. Draw Animated Background
    ctx.save();
    CanvasEngine.applyBackground(ctx, width, height, currentSlide.bg || { preset: 'dark_navy' });
    
    // Animated floating particles
    const particleTime = (slideIndex + progress) * 2;
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    for (let i = 0; i < 18; i++) {
      const px = (Math.sin(i * 1.3 + particleTime) * 0.4 + 0.5) * width;
      const py = (Math.cos(i * 1.7 + particleTime) * 0.4 + 0.5) * height;
      const pRadius = 2 + (i % 4) * 2;
      ctx.beginPath();
      ctx.arc(px, py, pRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Mockup Device Positioning & Animation
    ctx.save();
    
    // Ken-Burns Zoom & Pan effect
    const zoomScale = 1.0 + (progress * 0.08);
    let mockupX, mockupY, mockupW, mockupH;

    if (format === '16_9') {
      // Landscape Video (1920x1080)
      mockupW = 420;
      mockupH = 860;
      mockupX = currentSlide.isRTL ? width * 0.2 : width * 0.68;
      mockupY = height * 0.5 - mockupH / 2;

      // Entrance animation
      const entryProgress = Math.min(progress / 0.3, 1.0);
      const entryOffsetY = (1 - easeOutBack(entryProgress)) * 120;
      mockupY += entryOffsetY;

      // Draw Smartphone Mockup
      CanvasEngine.drawPhoneMockup(ctx, {
        x: mockupX - mockupW / 2,
        y: mockupY,
        width: mockupW,
        height: mockupH,
        tilt: currentSlide.isRTL ? 8 : -8,
        scale: zoomScale * 0.95,
        screenshotImg: currentSlide.screenshotImg,
        shadow: true
      });

      // Draw Animated Typography
      this.renderLandscapeTexts(ctx, width, height, currentSlide, progress, fontFamily);

    } else {
      // Portrait Video (1080x1920 - 9:16)
      mockupW = 680;
      mockupH = 1400;
      mockupX = width / 2;
      mockupY = height * 0.58 - mockupH / 2;

      // Entrance animation
      const entryProgress = Math.min(progress / 0.3, 1.0);
      const entryOffsetY = (1 - easeOutBack(entryProgress)) * 150;
      mockupY += entryOffsetY;

      // Draw Smartphone Mockup
      CanvasEngine.drawPhoneMockup(ctx, {
        x: mockupX - mockupW / 2,
        y: mockupY,
        width: mockupW,
        height: mockupH,
        tilt: 0,
        scale: zoomScale * 0.96,
        screenshotImg: currentSlide.screenshotImg,
        shadow: true
      });

      // Draw Animated Typography
      this.renderPortraitTexts(ctx, width, height, currentSlide, progress, fontFamily);
    }

    ctx.restore();

    // 3. Draw Slide Transition Overlay if transitioning
    if (isTransitioning) {
      ctx.save();
      if (transitionEffect === 'flash_glow') {
        const alpha = Math.sin(transProgress * Math.PI) * 0.6;
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.fillRect(0, 0, width, height);
      } else if (transitionEffect === 'fade_dark') {
        const alpha = Math.sin(transProgress * Math.PI) * 0.8;
        ctx.fillStyle = `rgba(11, 15, 25, ${alpha})`;
        ctx.fillRect(0, 0, width, height);
      } else if (transitionEffect === 'slide_left') {
        // Slide left wipe
        ctx.fillStyle = '#0B0F19';
        ctx.fillRect(width * (1 - transProgress), 0, width * transProgress, height);
      }
      ctx.restore();
    }

    // 4. Draw Animated Progress Bar at the bottom
    const totalProgress = (slideIndex + progress) / slides.length;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, height - 8, width, 8);
    const progGrad = ctx.createLinearGradient(0, 0, width, 0);
    progGrad.addColorStop(0, '#00F0FF');
    progGrad.addColorStop(1, '#3B82F6');
    ctx.fillStyle = progGrad;
    ctx.fillRect(0, height - 8, width * totalProgress, 8);
    ctx.restore();
  }

  /**
   * Render texts for 16:9 Landscape Video
   */
  renderLandscapeTexts(ctx, width, height, slide, progress, fontFamily) {
    const isRTL = !!slide.isRTL;
    ctx.save();
    ctx.direction = isRTL ? 'rtl' : 'ltr';
    ctx.textAlign = isRTL ? 'right' : 'left';

    const textX = isRTL ? width * 0.88 : width * 0.1;
    let textY = height * 0.35;
    const maxTextW = width * 0.44;

    // Text Reveal Opacity & Slide
    const textAlpha = Math.min(progress / 0.25, 1.0);
    const textSlideX = (1 - textAlpha) * (isRTL ? 40 : -40);

    ctx.translate(textSlideX, 0);

    // Badge
    if (slide.badgeText) {
      ctx.font = `700 22px "${fontFamily}", Inter, sans-serif`;
      const badgeW = ctx.measureText(slide.badgeText).width + 36;
      const badgeBoxX = isRTL ? textX - badgeW : textX;
      
      ctx.fillStyle = `rgba(0, 240, 255, ${0.15 * textAlpha})`;
      CanvasEngine.drawRoundedRect(ctx, badgeBoxX, textY - 26, badgeW, 36, 18);
      ctx.fill();
      ctx.strokeStyle = `rgba(0, 240, 255, ${textAlpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = `rgba(0, 240, 255, ${textAlpha})`;
      ctx.fillText(slide.badgeText, isRTL ? textX - 18 : textX + 18, textY);
      textY += 65;
    }

    // Headline
    ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
    ctx.font = `900 56px "${fontFamily}", Inter, sans-serif`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 20;

    const headLines = CanvasEngine.wrapText(ctx, slide.headline, maxTextW);
    for (const line of headLines.slice(0, 2)) {
      ctx.fillText(line, textX, textY);
      textY += 68;
    }

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.75 * textAlpha})`;
    ctx.font = `500 26px "${fontFamily}", Inter, sans-serif`;

    const subLines = CanvasEngine.wrapText(ctx, slide.subtitle, maxTextW);
    for (const line of subLines.slice(0, 2)) {
      ctx.fillText(line, textX, textY + 10);
      textY += 36;
    }

    // Google Play Store Call To Action Badge
    const ctaAlpha = Math.max(0, Math.min((progress - 0.2) / 0.3, 1.0));
    if (ctaAlpha > 0) {
      const ctaY = height * 0.75;
      const ctaW = 280;
      const ctaBoxX = isRTL ? textX - ctaW : textX;

      ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * ctaAlpha})`;
      CanvasEngine.drawRoundedRect(ctx, ctaBoxX, ctaY - 25, ctaW, 50, 14);
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * ctaAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${ctaAlpha})`;
      ctx.font = `700 18px "${fontFamily}", Inter, sans-serif`;
      ctx.fillText("▶ Disponible sur Google Play", isRTL ? textX - 20 : textX + 20, ctaY + 6);
    }

    ctx.restore();
  }

  /**
   * Render texts for 9:16 Portrait Video
   */
  renderPortraitTexts(ctx, width, height, slide, progress, fontFamily) {
    const isRTL = !!slide.isRTL;
    ctx.save();
    ctx.direction = isRTL ? 'rtl' : 'ltr';
    ctx.textAlign = 'center';

    let textY = 160;
    const textAlpha = Math.min(progress / 0.25, 1.0);

    // Badge
    if (slide.badgeText) {
      ctx.font = `700 26px "${fontFamily}", Inter, sans-serif`;
      const badgeW = ctx.measureText(slide.badgeText).width + 48;
      ctx.fillStyle = `rgba(0, 240, 255, ${0.15 * textAlpha})`;
      CanvasEngine.drawRoundedRect(ctx, width / 2 - badgeW / 2, textY - 34, badgeW, 48, 24);
      ctx.fill();
      ctx.strokeStyle = `rgba(0, 240, 255, ${textAlpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = `rgba(0, 240, 255, ${textAlpha})`;
      ctx.fillText(slide.badgeText, width / 2, textY);
      textY += 85;
    }

    // Headline
    ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
    ctx.font = `900 64px "${fontFamily}", Inter, sans-serif`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 20;

    const headLines = CanvasEngine.wrapText(ctx, slide.headline, 920);
    for (const line of headLines.slice(0, 2)) {
      ctx.fillText(line, width / 2, textY);
      textY += 75;
    }

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * textAlpha})`;
    ctx.font = `500 32px "${fontFamily}", Inter, sans-serif`;

    const subLines = CanvasEngine.wrapText(ctx, slide.subtitle, 900);
    for (const line of subLines.slice(0, 2)) {
      ctx.fillText(line, width / 2, textY + 10);
      textY += 44;
    }

    ctx.restore();
  }

  /**
   * Start Live Interactive Video Preview
   */
  startPreview(state, onProgressUpdate) {
    this.stop();
    this.isPlaying = true;
    this.initAudioTrack();

    const slideDuration = (state.slideDuration || 3) * 1000; // ms
    const totalSlides = state.slides.length;
    const totalDuration = slideDuration * totalSlides;
    const startTime = performance.now();

    const animate = (currentTime) => {
      if (!this.isPlaying) return;

      const elapsed = (currentTime - startTime) % totalDuration;
      const currentSlideIdx = Math.floor(elapsed / slideDuration);
      const slideProgress = (elapsed % slideDuration) / slideDuration;

      // Play sound on transition start
      if (slideProgress < 0.05 && (!this.lastSoundSlide || this.lastSoundSlide !== currentSlideIdx)) {
        this.lastSoundSlide = currentSlideIdx;
        this.playSlideSound(440 + currentSlideIdx * 70);
      }

      this.renderFrame(state, currentSlideIdx, slideProgress, slideDuration);

      if (onProgressUpdate) {
        onProgressUpdate({
          slideIndex: currentSlideIdx,
          totalSlides,
          overallProgress: elapsed / totalDuration,
          currentTimeSec: (elapsed / 1000).toFixed(1),
          totalDurationSec: (totalDuration / 1000).toFixed(1)
        });
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stop Video Preview / Animation
   */
  stop() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Render and Record Full Video to WebM / MP4 Blob
   */
  async exportVideo(state, onProgress, onComplete) {
    this.stop();
    this.isRecording = true;
    this.initAudioTrack();

    const slideDuration = (state.slideDuration || 3) * 1000;
    const totalSlides = state.slides.length;
    const totalDuration = slideDuration * totalSlides;
    const fps = 30;
    const totalFrames = Math.floor((totalDuration / 1000) * fps);

    // Setup Canvas Stream & Audio Stream
    const canvasStream = this.canvas.captureStream(fps);
    let combinedStream = canvasStream;

    if (this.audioDestination && this.audioDestination.stream) {
      const audioTrack = this.audioDestination.stream.getAudioTracks()[0];
      if (audioTrack) {
        canvasStream.addTrack(audioTrack);
      }
    }

    // Supported mime types
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    let selectedMime = 'video/webm';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    this.recordedChunks = [];
    try {
      this.mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 6000000 // 6 Mbps HD
      });
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(canvasStream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const videoBlob = new Blob(this.recordedChunks, { type: selectedMime });
      this.isRecording = false;
      if (onComplete) onComplete(videoBlob, selectedMime.includes('mp4') ? 'mp4' : 'webm');
    };

    this.mediaRecorder.start(100);

    // Frame-by-frame precise recording loop
    let currentFrame = 0;

    const renderNextRecordingFrame = () => {
      if (!this.isRecording || currentFrame >= totalFrames) {
        this.mediaRecorder.stop();
        return;
      }

      const currentTimeMs = (currentFrame / fps) * 1000;
      const slideIndex = Math.floor(currentTimeMs / slideDuration);
      const slideProgress = (currentTimeMs % slideDuration) / slideDuration;

      // Chime audio triggers
      if (slideProgress < (1 / (fps * (slideDuration / 1000)))) {
        this.playSlideSound(440 + slideIndex * 70);
      }

      this.renderFrame(state, slideIndex, slideProgress, slideDuration);

      currentFrame++;
      const progressPercent = Math.round((currentFrame / totalFrames) * 100);
      if (onProgress) onProgress(progressPercent);

      // Yield slightly to allow browser encoding
      setTimeout(renderNextRecordingFrame, 1000 / fps);
    };

    renderNextRecordingFrame();
  }
}

window.VideoEngine = VideoEngine;
