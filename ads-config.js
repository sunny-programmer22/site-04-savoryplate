/**
 * ============================================================================
 * SavoryPlate - HilltopAds Integration & Configuration Script
 * ============================================================================
 * This script manages all ad placements and interactive ad behaviors across
 * the SavoryPlate culinary portal. It supports both live HilltopAds production tags
 * and a rich local preview/fallback simulation mode for seamless development.
 *
 * Configured HilltopAds Ad Zones:
 * - Zone 1: Popunder / OnClick (Native Popunder with frequency capping)
 * - Zone 2: In-Page Push (IPP) MultiTag (Floating culinary recommendation push)
 * - Zone 3: MultiTag Banner (728x90 Header Leaderboard & 300x250 Recipe Sidebar)
 * - Zone 4: Video Slider MultiTag (Corner sticky video ad unit)
 * - Zone 5: Direct Link / SmartLink (Attached to 'Print Recipe PDF' & 'Buy Ingredients')
 * - Zone 6: Video VAST (Integrated with HTML5 cooking tutorial masterclass player)
 * ============================================================================
 */

(function (window, document) {
    'use strict';

    // Global HilltopAds Configuration
    window.HILLTOP_CONFIG = {
        publisherId: 'HTA_PUB_94821',
        siteId: 'HTA_SITE_SAVORYPLATE',
        environment: 'preview', // 'production' or 'preview'
        debugMode: true,

        // Zone 1: Popunder / OnClick
        zone1_popunder: {
            zoneId: '1084291',
            enabled: true,
            // HilltopAds official Popunder script placeholder
            scriptUrl: 'https://whoslick.com/pfe/current/micro.tag.min.js?z=1084291',
            // Direct SmartLink fallback url for testing
            directUrl: 'https://hilltopads.com/?ref=savoryplate_popunder',
            frequencyCappingHours: 4, // Trigger at most once every 4 hours per user
            triggerDelayMs: 300
        },

        // Zone 2: In-Page Push (IPP) MultiTag
        zone2_inPagePush: {
            zoneId: '1084292',
            enabled: true,
            scriptUrl: 'https://whoslick.com/pfe/current/tag.min.js?z=1084292',
            delayBeforeShowMs: 4000,
            previewCreative: {
                title: '👨‍🍳 Chef Marco Recommended',
                body: 'Exclusive 25% Off: Artisan Cast Iron Dutch Ovens & Chef Knives',
                icon: 'https://images.unsplash.com/photo-1584990347449-399c642643a5?auto=format&fit=crop&w=150&q=80',
                actionText: 'Claim Deal',
                ctaUrl: 'https://hilltopads.com/?ref=savoryplate_ipp'
            }
        },

        // Zone 3: MultiTag Banners
        zone3_multiTagBanner: {
            headerLeaderboard: {
                zoneId: '1084293',
                format: '728x90',
                containerId: 'hta-zone3-header',
                scriptUrl: 'https://whoslick.com/pfe/current/tag.min.js?z=1084293',
                sponsorTitle: 'Artisan Kitchen Supply Co. - Handcrafted Olive Wood Cutting Boards',
                badge: 'Kitchen Sponsor',
                ctaText: 'Shop Handcrafted',
                ctaUrl: 'https://hilltopads.com/?ref=savoryplate_leaderboard'
            },
            sidebarSquare: {
                zoneId: '1084294',
                format: '300x250',
                containerId: 'hta-zone3-sidebar',
                scriptUrl: 'https://whoslick.com/pfe/current/tag.min.js?z=1084294',
                sponsorTitle: 'Organic Tuscan Cold-Pressed Extra Virgin Olive Oil Reserve',
                badge: 'Featured Ingredient',
                ctaText: 'Taste The Harvest',
                ctaUrl: 'https://hilltopads.com/?ref=savoryplate_sidebar'
            },
            inContentBanner: {
                zoneId: '1084295',
                format: 'responsive',
                containerId: 'hta-zone3-incontent',
                sponsorTitle: 'Precision Induction Cooktops for Artisan Chefs - Fast, Precise, Consistent',
                badge: 'Culinary Gear',
                ctaText: 'Explore Models',
                ctaUrl: 'https://hilltopads.com/?ref=savoryplate_incontent'
            }
        },

        // Zone 4: Video Slider MultiTag
        zone4_videoSlider: {
            zoneId: '1084296',
            enabled: true,
            scrollTriggerPercent: 20, // Slide in after scrolling 20% down page
            scriptUrl: 'https://whoslick.com/pfe/current/slider.tag.min.js?z=1084296',
            videoPreviewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cutting-vegetables-on-a-wooden-board-42999-large.mp4',
            title: 'Mastering Knife Skills',
            sponsor: 'Global Kitchen Cutlery',
            ctaText: 'Watch Series',
            ctaUrl: 'https://hilltopads.com/?ref=savoryplate_slider'
        },

        // Zone 5: Direct Link / SmartLink
        zone5_directLink: {
            zoneId: '1084297',
            enabled: true,
            // HilltopAds DirectLink URL template
            smartlinkUrl: 'https://xml.hilltopads.net/smartlink?zoneId=1084297&subid=savoryplate_cta',
            buttonSelectors: [
                '#btn-print-recipe',
                '#btn-buy-ingredients',
                '#btn-download-mealplan',
                '.direct-smartlink-btn'
            ]
        },

        // Zone 6: Video VAST
        zone6_videoVAST: {
            zoneId: '1084298',
            enabled: true,
            vastTagUrl: 'https://xml.hilltopads.net/vast?zoneId=1084298&env=culinary_pre_roll',
            adDurationSeconds: 6,
            skipOffsetSeconds: 3,
            sponsorName: 'Tuscan Pantry Co. Organic Herbed Sea Salts',
            sponsorUrl: 'https://hilltopads.com/?ref=savoryplate_vast',
            adVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-seasoning-meat-in-a-skillet-42996-large.mp4'
        }
    };

    /**
     * Ad Engine Controller
     */
    const SavoryAdsEngine = {
        init: function () {
            this.log('Initializing SavoryPlate HilltopAds Module...');
            this.setupZone1Popunder();
            this.setupZone2InPagePush();
            this.setupZone3Banners();
            this.setupZone4VideoSlider();
            this.setupZone5DirectLinks();
            this.setupZone6VideoVAST();
            this.setupDebugConsole();
        },

        log: function (msg, data) {
            if (window.HILLTOP_CONFIG.debugMode) {
                console.log(`[HilltopAds Engine] %c${msg}`, 'color: #c85a32; font-weight: bold;', data || '');
            }
        },

        /**
         * Zone 1: Popunder / OnClick Integration
         * Attached to window click events with frequency capping in localStorage
         */
        setupZone1Popunder: function () {
            const config = window.HILLTOP_CONFIG.zone1_popunder;
            if (!config.enabled) return;

            const storageKey = 'savory_hta_popunder_last';
            let hasTriggeredInSession = false;

            const canTrigger = () => {
                if (hasTriggeredInSession) return false;
                const lastTrigger = localStorage.getItem(storageKey);
                if (!lastTrigger) return true;
                const diffHours = (Date.now() - parseInt(lastTrigger, 10)) / (1000 * 60 * 60);
                return diffHours >= config.frequencyCappingHours;
            };

            const triggerPopunder = (e) => {
                if (!canTrigger()) return;
                // Avoid capturing clicks on specific interactive controls like modal close
                if (e.target.closest('.no-popunder, .ad-close-btn, #btn-ad-debug-toggle')) return;

                hasTriggeredInSession = true;
                localStorage.setItem(storageKey, Date.now().toString());
                SavoryAdsEngine.log(`Zone 1 (Popunder/OnClick - Zone ${config.zoneId}) triggered on user gesture.`);

                if (window.HILLTOP_CONFIG.environment === 'production') {
                    // In production, execute the HilltopAds dynamic pop script
                    const s = document.createElement('script');
                    s.type = 'text/javascript';
                    s.src = config.scriptUrl;
                    document.head.appendChild(s);
                } else {
                    // Preview feedback toast
                    SavoryAdsEngine.showNotificationToast(
                        `✨ HilltopAds Zone 1 (Popunder #${config.zoneId}) activated! (Frequency cap: 1 / ${config.frequencyCappingHours} hrs)`
                    );
                }
            };

            // HilltopAds popunders listen to user interaction
            window.addEventListener('click', triggerPopunder, { once: false, capture: true });
        },

        /**
         * Zone 2: In-Page Push (IPP) MultiTag
         * Non-intrusive floating culinary recommendation notification
         */
        setupZone2InPagePush: function () {
            const config = window.HILLTOP_CONFIG.zone2_inPagePush;
            if (!config.enabled) return;

            const dismissed = sessionStorage.getItem('savory_hta_ipp_dismissed');
            if (dismissed) return;

            setTimeout(() => {
                const ippContainer = document.getElementById('hta-ipp-widget');
                if (!ippContainer) return;

                if (window.HILLTOP_CONFIG.environment === 'production') {
                    // Inject HilltopAds IPP MultiTag script
                    const script = document.createElement('script');
                    script.src = config.scriptUrl;
                    script.async = true;
                    document.body.appendChild(script);
                }

                // Render dynamic IPP UI
                ippContainer.innerHTML = `
                    <div class="ipp-card" role="alert" aria-live="polite">
                        <button class="ipp-close-btn ad-close-btn" aria-label="Close push notification">&times;</button>
                        <div class="ipp-header">
                            <span class="ipp-badge">HilltopAds MultiTag IPP • Zone #${config.zoneId}</span>
                        </div>
                        <div class="ipp-content">
                            <img src="${config.previewCreative.icon}" alt="Culinary Recommendation" class="ipp-thumb" />
                            <div class="ipp-text">
                                <h4 class="ipp-title">${config.previewCreative.title}</h4>
                                <p class="ipp-body">${config.previewCreative.body}</p>
                            </div>
                        </div>
                        <div class="ipp-actions">
                            <a href="${config.previewCreative.ctaUrl}" target="_blank" rel="noopener sponsored" class="ipp-cta-btn">
                                ${config.previewCreative.actionText} <span class="arrow">&rarr;</span>
                            </a>
                        </div>
                    </div>
                `;

                // Slide in animation
                requestAnimationFrame(() => {
                    ippContainer.classList.add('ipp-visible');
                });

                // Close handler
                const closeBtn = ippContainer.querySelector('.ipp-close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        ippContainer.classList.remove('ipp-visible');
                        sessionStorage.setItem('savory_hta_ipp_dismissed', 'true');
                        SavoryAdsEngine.log('Zone 2 IPP dismissed by user.');
                    });
                }
            }, config.delayBeforeShowMs);
        },

        /**
         * Zone 3: MultiTag Banners (Header 728x90, Sidebar 300x250, In-Content)
         */
        setupZone3Banners: function () {
            const banners = window.HILLTOP_CONFIG.zone3_multiTagBanner;

            // Render Header Leaderboard 728x90
            const headerEl = document.getElementById(banners.headerLeaderboard.containerId);
            if (headerEl) {
                this.renderBannerSlot(headerEl, banners.headerLeaderboard);
            }

            // Render Sidebar 300x250
            const sidebarEl = document.getElementById(banners.sidebarSquare.containerId);
            if (sidebarEl) {
                this.renderBannerSlot(sidebarEl, banners.sidebarSquare);
            }

            // Render In-Content Banner
            const inContentEl = document.getElementById(banners.inContentBanner.containerId);
            if (inContentEl) {
                this.renderBannerSlot(inContentEl, banners.inContentBanner);
            }
        },

        renderBannerSlot: function (container, bannerConfig) {
            if (window.HILLTOP_CONFIG.environment === 'production') {
                // HilltopAds MultiTag banner insertion
                const s = document.createElement('script');
                s.src = bannerConfig.scriptUrl;
                s.async = true;
                container.appendChild(s);
            } else {
                // High-fidelity culinary sponsor banner fallback
                container.innerHTML = `
                    <div class="hta-banner-frame ${bannerConfig.format}">
                        <div class="hta-banner-meta">
                            <span class="hta-sponsor-badge">${bannerConfig.badge || 'Sponsored'}</span>
                            <span class="hta-zone-info">HilltopAds MultiTag Zone #${bannerConfig.zoneId}</span>
                        </div>
                        <div class="hta-banner-body">
                            <div class="hta-banner-copy">
                                <h3>${bannerConfig.sponsorTitle}</h3>
                                <p class="hta-banner-sub">Premium artisan quality crafted for passionate home cooks.</p>
                            </div>
                            <a href="${bannerConfig.ctaUrl}" target="_blank" rel="noopener sponsored" class="hta-banner-cta">
                                ${bannerConfig.ctaText} &rarr;
                            </a>
                        </div>
                    </div>
                `;
            }
        },

        /**
         * Zone 4: Video Slider MultiTag
         * Elegant corner docked video player appearing after user scrolls down
         */
        setupZone4VideoSlider: function () {
            const config = window.HILLTOP_CONFIG.zone4_videoSlider;
            if (!config.enabled) return;

            const sliderContainer = document.getElementById('hta-video-slider');
            if (!sliderContainer) return;

            let hasAppeared = false;

            const onScroll = () => {
                if (hasAppeared) return;
                const scrollPos = window.scrollY || window.pageYOffset;
                const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
                const currentPercent = (scrollPos / totalDocHeight) * 100;

                if (currentPercent >= config.scrollTriggerPercent) {
                    hasAppeared = true;
                    window.removeEventListener('scroll', onScroll);
                    this.renderVideoSlider(sliderContainer, config);
                }
            };

            window.addEventListener('scroll', onScroll, { passive: true });
        },

        renderVideoSlider: function (container, config) {
            container.innerHTML = `
                <div class="slider-widget-box" id="slider-widget-box">
                    <div class="slider-header">
                        <span class="slider-zone-tag">HilltopAds Video Slider • Zone #${config.zoneId}</span>
                        <div class="slider-controls">
                            <button id="slider-mute-toggle" class="slider-icon-btn" title="Toggle Sound">🔇</button>
                            <button id="slider-minimize-btn" class="slider-icon-btn" title="Minimize">&minus;</button>
                            <button id="slider-close-btn" class="slider-icon-btn ad-close-btn" title="Close">&times;</button>
                        </div>
                    </div>
                    <div class="slider-video-wrapper">
                        <video id="hta-slider-video" autoplay loop muted playsinline poster="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=80">
                            <source src="${config.videoPreviewUrl}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <div class="slider-overlay">
                            <span class="slider-sponsor">${config.sponsor}</span>
                            <h4 class="slider-title">${config.title}</h4>
                            <a href="${config.ctaUrl}" target="_blank" rel="noopener sponsored" class="slider-cta-btn">
                                ${config.ctaText} &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            `;

            requestAnimationFrame(() => {
                container.classList.add('slider-active');
            });

            const box = document.getElementById('slider-widget-box');
            const closeBtn = document.getElementById('slider-close-btn');
            const minBtn = document.getElementById('slider-minimize-btn');
            const muteBtn = document.getElementById('slider-mute-toggle');
            const video = document.getElementById('hta-slider-video');

            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    container.classList.remove('slider-active');
                    if (video) video.pause();
                    SavoryAdsEngine.log('Zone 4 Video Slider closed by user.');
                });
            }

            if (minBtn) {
                minBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    box.classList.toggle('slider-minimized');
                    minBtn.innerHTML = box.classList.contains('slider-minimized') ? '&#9633;' : '&minus;';
                });
            }

            if (muteBtn && video) {
                muteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    video.muted = !video.muted;
                    muteBtn.textContent = video.muted ? '🔇' : '🔊';
                });
            }
        },

        /**
         * Zone 5: Direct Link / SmartLink
         * Attaches HilltopAds smartlink handling to high-intent culinary actions:
         * - 'Print Recipe PDF' button
         * - 'Buy Ingredients' button
         * - 'Download Meal Plan' button
         */
        setupZone5DirectLinks: function () {
            const config = window.HILLTOP_CONFIG.zone5_directLink;
            if (!config.enabled) return;

            config.buttonSelectors.forEach((selector) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((btn) => {
                    btn.addEventListener('click', (event) => {
                        const originalText = btn.innerHTML;
                        const actionType = btn.getAttribute('data-action') || 'action';

                        SavoryAdsEngine.log(`Zone 5 Direct Link (Zone #${config.zoneId}) invoked via ${selector}`);

                        // Open the HilltopAds smartlink monetization tab
                        const smartlinkWindow = window.open(config.smartlinkUrl, '_blank', 'noopener,noreferrer');

                        // Execute original user intent seamlessly
                        if (actionType === 'print') {
                            window.print();
                        } else if (actionType === 'cart') {
                            SavoryAdsEngine.showNotificationToast('🛒 All 9 ingredients sent to your Grocery Shopping Cart!');
                        } else if (actionType === 'mealplan') {
                            SavoryAdsEngine.showNotificationToast('📥 7-Day Artisan Meal Prep Guide is downloading!');
                        }
                    });
                });
            });
        },

        /**
         * Zone 6: Video VAST Integration
         * Embedded directly into the culinary masterclass video player
         * Features interactive pre-roll countdown, sponsor label, and skip timer
         */
        setupZone6VideoVAST: function () {
            const config = window.HILLTOP_CONFIG.zone6_videoVAST;
            if (!config.enabled) return;

            const playerContainer = document.getElementById('hta-vast-player-container');
            const mainVideo = document.getElementById('recipe-main-video');
            const playTriggerBtn = document.getElementById('video-masterclass-play-btn');

            if (!playerContainer || !mainVideo || !playTriggerBtn) return;

            let adPlayed = false;

            playTriggerBtn.addEventListener('click', () => {
                if (!adPlayed) {
                    this.playVASTPreRoll(playerContainer, mainVideo, config, () => {
                        adPlayed = true;
                        mainVideo.play();
                    });
                } else {
                    mainVideo.play();
                    playTriggerBtn.style.display = 'none';
                }
            });
        },

        playVASTPreRoll: function (container, mainVideo, config, onAdComplete) {
            SavoryAdsEngine.log(`Zone 6: Video VAST pre-roll initiated (Zone #${config.zoneId})`);

            // Create VAST overlay over video player
            const vastOverlay = document.createElement('div');
            vastOverlay.className = 'vast-ad-overlay';
            vastOverlay.id = 'vast-ad-overlay';

            let secondsRemaining = config.adDurationSeconds;
            let canSkip = false;

            vastOverlay.innerHTML = `
                <div class="vast-ad-badge">
                    <span class="vast-tag">Ad by HilltopAds • Zone #${config.zoneId}</span>
                    <span class="vast-countdown" id="vast-timer">Ad finishes in ${secondsRemaining}s</span>
                </div>
                <video id="vast-ad-video" class="vast-video-elem" autoplay playsinline>
                    <source src="${config.adVideoUrl}" type="video/mp4">
                </video>
                <div class="vast-bottom-bar">
                    <div class="vast-sponsor-info">
                        <span class="vast-label">Sponsor</span>
                        <a href="${config.sponsorUrl}" target="_blank" rel="noopener sponsored" class="vast-sponsor-link">
                            ${config.sponsorName} &rarr;
                        </a>
                    </div>
                    <button id="vast-skip-btn" class="vast-skip-btn" disabled>
                        Skip Ad in <span id="vast-skip-countdown">${config.skipOffsetSeconds}</span>s
                    </button>
                </div>
                <div class="vast-progress"><div class="vast-progress-fill" id="vast-progress-fill"></div></div>
            `;

            container.appendChild(vastOverlay);

            const adVideo = document.getElementById('vast-ad-video');
            const timerEl = document.getElementById('vast-timer');
            const skipBtn = document.getElementById('vast-skip-btn');
            const skipTimerEl = document.getElementById('vast-skip-countdown');
            const progressFill = document.getElementById('vast-progress-fill');

            let skipCountdown = config.skipOffsetSeconds;

            const countdownInterval = setInterval(() => {
                secondsRemaining--;
                if (timerEl) timerEl.textContent = `Ad finishes in ${Math.max(secondsRemaining, 0)}s`;

                if (skipCountdown > 0) {
                    skipCountdown--;
                    if (skipTimerEl) skipTimerEl.textContent = skipCountdown;
                } else if (!canSkip) {
                    canSkip = true;
                    if (skipBtn) {
                        skipBtn.disabled = false;
                        skipBtn.innerHTML = 'Skip Ad &rarr;';
                        skipBtn.classList.add('vast-skip-ready');
                    }
                }

                const elapsed = config.adDurationSeconds - secondsRemaining;
                const progressPct = (elapsed / config.adDurationSeconds) * 100;
                if (progressFill) progressFill.style.width = `${Math.min(progressPct, 100)}%`;

                if (secondsRemaining <= 0) {
                    cleanupAndProceed();
                }
            }, 1000);

            const cleanupAndProceed = () => {
                clearInterval(countdownInterval);
                if (vastOverlay && vastOverlay.parentNode) {
                    vastOverlay.parentNode.removeChild(vastOverlay);
                }
                const playBtn = document.getElementById('video-masterclass-play-btn');
                if (playBtn) playBtn.style.display = 'none';
                SavoryAdsEngine.log('Zone 6 VAST Ad finished. Resuming culinary masterclass.');
                onAdComplete();
            };

            if (skipBtn) {
                skipBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (canSkip) {
                        SavoryAdsEngine.log('Zone 6 VAST Ad skipped by user.');
                        cleanupAndProceed();
                    }
                });
            }

            if (adVideo) {
                adVideo.onended = cleanupAndProceed;
            }
        },

        /**
         * Floating Notification Toast
         */
        showNotificationToast: function (message) {
            let toastContainer = document.getElementById('savory-toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'savory-toast-container';
                toastContainer.className = 'savory-toast-container';
                document.body.appendChild(toastContainer);
            }

            const toast = document.createElement('div');
            toast.className = 'savory-toast';
            toast.innerHTML = `<span>${message}</span>`;
            toastContainer.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('toast-fade-out');
                setTimeout(() => toast.remove(), 400);
            }, 3500);
        },

        /**
         * Ad Inspector / Debug Modal
         * Allows developers and site owners to view active HilltopAds zones, IDs and test triggers
         */
        setupDebugConsole: function () {
            const debugToggle = document.getElementById('btn-ad-debug-toggle');
            const debugModal = document.getElementById('ad-debug-modal');
            const closeDebug = document.getElementById('ad-debug-close');

            if (!debugToggle || !debugModal) return;

            debugToggle.addEventListener('click', () => {
                debugModal.classList.toggle('modal-open');
            });

            if (closeDebug) {
                closeDebug.addEventListener('click', () => {
                    debugModal.classList.remove('modal-open');
                });
            }

            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && debugModal.classList.contains('modal-open')) {
                    debugModal.classList.remove('modal-open');
                }
            });
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SavoryAdsEngine.init());
    } else {
        SavoryAdsEngine.init();
    }

    // Expose engine to global scope for testing
    window.SavoryAdsEngine = SavoryAdsEngine;

})(window, document);
