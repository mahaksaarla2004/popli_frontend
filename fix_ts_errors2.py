import os

files_to_fix = [
    'src/app/(auth)/create-new-password.tsx',
    'src/app/(auth)/forgot-password.tsx',
    'src/app/(auth)/login.tsx',
    'src/app/(auth)/otp.tsx',
    'src/app/(auth)/profile-setup.tsx',
    'src/app/chat/[id].tsx'
]

base_dir = r"c:\Users\Mahek Saarla\Desktop\Personal_Folder\popliapp"

replacements = {
    'PressablePlatform': 'Pressable, Platform',
    'PressableScrollView': 'Pressable, ScrollView',
    'ScrollViewPlatform': 'ScrollView, Platform',
}

for file in files_to_fix:
    path = os.path.join(base_dir, file.replace('/', '\\'))
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    for bad, good in replacements.items():
        content = content.replace(bad, good)
        
    if 'login.tsx' in file:
        content = content.replace('import { View, Text, TextInput, Image', 'import { View, Text, TextInput, Image, ScrollView, Pressable')
            
    if 'profile-setup.tsx' in file:
        content = content.replace('import { View, Text, TextInput, TouchableOpacity, Image', 'import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Platform')

    if 'create-new-password.tsx' in file:
        content = content.replace('import { View, Text, TextInput, Platform, Keyboard }', 'import { View, Text, TextInput, Platform, Keyboard, Pressable }')

    if 'forgot-password.tsx' in file:
        content = content.replace('import { View, Text, TextInput, Platform, Keyboard }', 'import { View, Text, TextInput, Platform, Keyboard, Pressable }')

    if 'otp.tsx' in file:
        content = content.replace('import { View, Text, TextInput, Platform, Keyboard }', 'import { View, Text, TextInput, Platform, Keyboard, Pressable }')
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed imports 2")
