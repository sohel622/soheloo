package com.tweetgram.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdLoader
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.VideoOptions
import com.google.android.gms.ads.nativead.NativeAd
import com.google.android.gms.ads.nativead.NativeAdOptions
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import org.json.JSONObject

/**
 * TweetGram Android Main Activity
 * Integrates Google Mobile Ads (AdMob):
 * 1. Rewarded Video Ads
 * 2. Native Advanced Ads (AdLoader with 16:9 MediaView, startMuted: true)
 * 
 * Application ID: ca-app-pub-5064214568275450~8904258078
 * Rewarded Video Ad Unit ID: ca-app-pub-5064214568275450/2276524526
 * Native Ad Unit ID: ca-app-pub-5064214568275450/6111827751
 */
class MainActivity : AppCompatActivity() {

    private var rewardedAd: RewardedAd? = null
    private var isRewardedAdLoading = false
    private val rewardedAdUnitId = "ca-app-pub-5064214568275450/2276524526"

    private var currentNativeAd: NativeAd? = null
    private var isNativeAdLoading = false
    private val nativeAdUnitId = "ca-app-pub-5064214568275450/6111827751"

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Initialize Google Mobile Ads SDK on startup
        MobileAds.initialize(this) { initializationStatus ->
            // Preload the Rewarded Video Ad on startup
            loadRewardedVideoAd()
            // Load the Native Advanced Ad on startup using AdLoader
            loadNativeAd()
        }

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            webViewClient = WebViewClient()
            webChromeClient = WebChromeClient()
            // Expose AdMob JavaScript Interface to the Web UI
            addJavascriptInterface(AdMobBridge(), "AndroidAdMob")
        }

        setContentView(webView)
        webView.loadUrl("file:///android_asset/index.html")
    }

    /**
     * Load Google Mobile Ads Native Advanced Ad using AdLoader.Builder
     * Configures VideoOptions (start muted: true)
     */
    fun loadNativeAd() {
        if (isNativeAdLoading) return
        isNativeAdLoading = true

        val videoOptions = VideoOptions.Builder()
            .setStartMuted(true)
            .build()

        val nativeAdOptions = NativeAdOptions.Builder()
            .setVideoOptions(videoOptions)
            .build()

        val adLoader = AdLoader.Builder(this, nativeAdUnitId)
            .forNativeAd { ad: NativeAd ->
                currentNativeAd?.destroy()
                currentNativeAd = ad
                isNativeAdLoading = false

                val adJson = JSONObject().apply {
                    put("headline", ad.headline ?: "")
                    put("body", ad.body ?: "")
                    put("advertiser", ad.advertiser ?: "")
                    put("callToAction", ad.callToAction ?: "Learn more")
                    put("hasVideoContent", ad.mediaContent?.hasVideoContent() ?: false)
                    put("aspectRatio", ad.mediaContent?.aspectRatio ?: 1.777f)
                    put("iconUrl", ad.icon?.uri?.toString() ?: "")
                }

                runOnUiThread {
                    webView.evaluateJavascript(
                        "window.onAdMobNativeAdLoaded && window.onAdMobNativeAdLoaded(${adJson})",
                        null
                    )
                }
            }
            .withAdListener(object : AdListener() {
                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    isNativeAdLoading = false
                    runOnUiThread {
                        webView.evaluateJavascript(
                            "window.onAdMobNativeAdFailedToLoad && window.onAdMobNativeAdFailedToLoad('${loadAdError.message}')",
                            null
                        )
                    }
                }
            })
            .withNativeAdOptions(nativeAdOptions)
            .build()

        adLoader.loadAd(AdRequest.Builder().build())
    }

    /**
     * Preload Rewarded Video Ad in background
     */
    fun loadRewardedVideoAd() {
        if (isRewardedAdLoading || rewardedAd != null) return

        isRewardedAdLoading = true
        val adRequest = AdRequest.Builder().build()
        RewardedAd.load(this, rewardedAdUnitId, adRequest, object : RewardedAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedAd) {
                rewardedAd = ad
                isRewardedAdLoading = false
                notifyWebAdReady(true)
            }

            override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                rewardedAd = null
                isRewardedAdLoading = false
                notifyWebAdReady(false)
            }
        })
    }

    private fun notifyWebAdReady(isReady: Boolean) {
        runOnUiThread {
            webView.evaluateJavascript("window.onAdMobRewardedStatusChanged && window.onAdMobRewardedStatusChanged($isReady)", null)
        }
    }

    override fun onDestroy() {
        currentNativeAd?.destroy()
        super.onDestroy()
    }

    /**
     * JavaScript Bridge Interface connecting Web UI to native AdMob SDK
     */
    inner class AdMobBridge {

        @JavascriptInterface
        fun loadNativeAd() {
            runOnUiThread {
                this@MainActivity.loadNativeAd()
            }
        }

        @JavascriptInterface
        fun isRewardedAdReady(): Boolean {
            return rewardedAd != null
        }

        @JavascriptInterface
        fun showRewardedAd() {
            runOnUiThread {
                if (rewardedAd != null) {
                    rewardedAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
                        override fun onAdDismissedFullScreenContent() {
                            rewardedAd = null
                            loadRewardedVideoAd()
                            webView.evaluateJavascript("window.onAdMobRewardedDismissed && window.onAdMobRewardedDismissed()", null)
                        }

                        override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                            rewardedAd = null
                            loadRewardedVideoAd()
                            webView.evaluateJavascript("window.onAdMobRewardedFailed && window.onAdMobRewardedFailed('${adError.message}')", null)
                        }

                        override fun onAdShowedFullScreenContent() {}
                    }

                    rewardedAd?.show(this@MainActivity) { rewardItem ->
                        Toast.makeText(
                            this@MainActivity,
                            "Rewarded Ad completed! Reward granted: ${rewardItem.amount} ${rewardItem.type}",
                            Toast.LENGTH_SHORT
                        ).show()

                        webView.evaluateJavascript(
                            "window.onAdMobRewardGranted && window.onAdMobRewardGranted(${rewardItem.amount}, '${rewardItem.type}')",
                            null
                        )
                    }
                } else {
                    Toast.makeText(this@MainActivity, "Ad is still loading. Retrying...", Toast.LENGTH_SHORT).show()
                    loadRewardedVideoAd()
                }
            }
        }
    }
}
