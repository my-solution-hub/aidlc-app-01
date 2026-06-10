# Retrofit
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.awsome.shop.data.** { *; }

# Kotlinx Serialization
-keepclassmembers class kotlinx.serialization.json.** { *** Companion; }
-keepclasseswithmembers class kotlinx.serialization.json.** { kotlinx.serialization.KSerializer serializer(...); }
-keep,includedescriptorclasses class com.awsome.shop.**$$serializer { *; }
-keepclassmembers class com.awsome.shop.** { *** Companion; }
-keepclasseswithmembers class com.awsome.shop.** { kotlinx.serialization.KSerializer serializer(...); }
