import os
import re

files_to_fix = [
    'src/app/(auth)/signup.tsx',
    'src/app/(create)/live-setup.tsx',
    'src/app/(create)/post-editor.tsx',
    'src/app/(create)/share.tsx',
    'src/app/(create)/story-editor.tsx',
    'src/app/(tabs)/discover.tsx',
    'src/app/(tabs)/inbox.tsx',
    'src/app/(tabs)/rewards.tsx',
    'src/app/change-password.tsx',
    'src/app/edit-profile.tsx',
    'src/app/support.tsx',
    'src/app/wallet.tsx',
    'src/components/RechargeCoinsSheet.tsx',
    'src/components/sheets/SendSheet.tsx'
]

base_dir = r"c:\Users\Mahek Saarla\Desktop\Personal_Folder\popliapp"

replacements = {
    'PressablePlatform': 'Pressable, Platform',
    'ImagePlatform': 'Image, Platform',
    'TextInputPlatform': 'TextInput, Platform',
    'DimensionsPlatform': 'Dimensions, Platform',
    'AlertPlatform': 'Alert, Platform',
    'PlatformModal': 'Platform, Modal',
}

for file in files_to_fix:
    path = os.path.join(base_dir, file.replace('/', '\\'))
    if not os.path.exists(path):
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply replacements
    for bad, good in replacements.items():
        content = content.replace(bad, good)
        
    # Extra fix for signup.tsx missing Pressable
    if 'signup.tsx' in file:
        if 'Pressable' not in content.split('\n')[1]:
            content = content.replace('import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Keyboard }', 
                                      'import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Keyboard, Pressable }')
            
    # Fix SendSheet missing Modal
    if 'SendSheet.tsx' in file:
        if 'Modal' not in content.split('\n')[1] and 'Modal' not in content.split('\n')[2]:
            content = content.replace('PlatformModal', 'Platform, Modal')

    # Fix RechargeCoinsSheet.tsx multiple attributes
    if 'RechargeCoinsSheet.tsx' in file:
        # We need to find the duplicate attribute. Let's just fix it.
        pass # Will do manually if needed

    # write back
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed imports")
