# ==============================================================================
# WordWeave Advanced ProGuard / R8 Obfuscation & Security Rules
# ==============================================================================

# 1. Code Obfuscation & Binary Hardening
-repackageclasses ''
-allowaccessmodification
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable,InnerClasses,EnclosingMethod

# Strip all debug logs in production release builds
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
    public static int i(...);
    public static int w(...);
}

# 2. React Native & Hermes Core Protection
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keepattributes Signature,Exceptions,*Annotation*

# JNI & C++ Bridge bindings
-keepclassmembers class * {
    native <methods>;
}

# 3. Google Mobile Ads (AdMob) Safe Protections
-keep class com.google.android.gms.ads.** { *; }
-keep class io.invertase.googlemobileads.** { *; }
-dontwarn com.google.android.gms.ads.**
-dontwarn io.invertase.googlemobileads.**

# 4. Third-party Libraries Keep Rules
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }
-keep class com.horcrux.svg.** { *; }

# 5. Anti-Reverse Engineering: prevent reflection on internal models
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
