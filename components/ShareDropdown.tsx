import { PodcastSource } from '@/types/podcast';
import * as Clipboard from 'expo-clipboard';
import { BookOpen, Bot, Copy, Share } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Modal, Platform, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface ShareDropdownProps {
  contentInfo: {
    title: string;
    subtitle?: string;
    description?: string;
    summary?: string;
  } | null;
  script?: string;
  sources?: PodcastSource[];
  onExamineSources?: () => void;
}

export function ShareDropdown({ contentInfo, script, sources, onExamineSources }: ShareDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<View>(null);
  const { height: windowHeight } = useWindowDimensions();

  const measureButtonPosition = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPosition({ x, y, width, height });
      });
    }
  };

  const handleButtonPress = () => {
    if (!isOpen) {
      measureButtonPosition();
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside (only on web)
  useEffect(() => {
    if (Platform.OS === 'web' && isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('[data-dropdown]')) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const generateSystemPrompt = (includeSources = false, encodeForUrl = true) => {
    if (!contentInfo) return '';
    
    // Combine script and description for full transcript
    const fullTranscript = `${script || ''}\n\n${contentInfo.description || ''}`.trim();
    
    let fullContent = `Assume the role of an adult learning professional. Help trigger 3 questions that support inductive reasoning of the following lesson material and challenge learners to delve deeper using Singapore or regional specific examples where appropriate.

<notes>
<critical>
Below are notes from a video course about working with the Claude language model.
Use these notes as a resource to answer the user's question.
Write your answer as a standalone response - do not refer directly to these notes unless specifically requested by the user.
</critical>

${fullTranscript}

${contentInfo.summary ? `**Key Highlights**\n${contentInfo.summary}` : ''}`;

    // Add sources if requested
    if (includeSources && sources && sources.length > 0) {
      fullContent += '\n\n**Further Reading:**\n';
      sources.forEach((source, index) => {
        const sourceLine = `${index + 1}. ${source.title} - ${source.author || 'Unknown'} (${source.publishedDate || 'N/A'})\n`;
        const urlLine = `   URL: ${source.url}\n`;
        fullContent += sourceLine + urlLine;
      });
    }

    return encodeForUrl ? encodeURIComponent(fullContent) : fullContent;
  };

  const generateCleanContent = (includeSources = false) => {
    if (!contentInfo) return '';
    
    // Combine script and description for full transcript
    const fullTranscript = `${script || ''}\n\n${contentInfo.description || ''}`.trim();
    
    let cleanContent = `**${contentInfo.title}**\n\n${fullTranscript}`;

    if (contentInfo.summary) {
      cleanContent += `\n\n**Key Highlights**\n${contentInfo.summary}`;
    }

    // Add sources if requested
    if (includeSources && sources && sources.length > 0) {
      cleanContent += '\n\n**Further Reading:**\n';
      sources.forEach((source, index) => {
        const sourceLine = `${index + 1}. ${source.title} - ${source.author || 'Unknown'} (${source.publishedDate || 'N/A'})\n`;
        const urlLine = `   URL: ${source.url}\n`;
        cleanContent += sourceLine + urlLine;
      });
    }

    return cleanContent;
  };

  const handleOpenInAI = async (platform: 'claude' | 'gemini') => {
    switch (platform) {
      case 'claude':
        // Use the remix format with attachment parameter
        const claudePrompt = generateSystemPrompt(false, true); // Encode for URL
        const claudeUrl = `https://claude.ai/remix#q=Explain%20this%20concept%3A&attachment=${claudePrompt}`;
        if (Platform.OS === 'web') {
          window.open(claudeUrl, '_blank');
        } else {
          await Linking.openURL(claudeUrl);
        }
        break;
      case 'gemini':
        if (Platform.OS === 'web') {
          // Direct injection approach for Gemini
          await handleGeminiInjection('');
        } else {
          // For mobile, fall back to share URL
          const geminiPrompt = generateSystemPrompt(false, true); // Encode for URL
          const geminiUrl = `https://gemini.google.com/app?prompt=${geminiPrompt}`;
          await Linking.openURL(geminiUrl);
        }
        break;
    }
  };

  const handleGeminiInjection = async (content: string) => {
    try {
      // Get raw content for clipboard (not URL-encoded) - include sources for Gemini
      const rawContent = generateSystemPrompt(true, false); // Include sources, don't encode for URL

      // Copy to clipboard first
      try {
        await navigator.clipboard.writeText(rawContent);
        console.log('Content copied to clipboard successfully');
      } catch (clipboardError) {
        console.warn('Clipboard access failed:', clipboardError);
        // Fallback to older clipboard API
        try {
          const textArea = document.createElement('textarea');
          textArea.value = rawContent;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        } catch (fallbackError) {
          console.error('All clipboard methods failed:', fallbackError);
        }
      }

      // Open Gemini in new tab
      const geminiWindow = window.open('https://gemini.google.com/app', '_blank');

      if (!geminiWindow) {
        if (Platform.OS === 'web') {
          window.alert('Error: Please allow popups for this site to use the Gemini integration.');
        } else {
          Alert.alert('Error', 'Please allow popups for this site to use the Gemini integration.');
        }
        return;
      }

      // Show immediate user instruction
      setTimeout(() => {
        if (Platform.OS === 'web') {
          // Use browser's native alert for web - more reliable
          const message = 'Content Ready for Gemini!\n\n' +
            'Your podcast content has been copied to clipboard.\n\n' +
            '1. Switch to the Gemini tab that just opened\n' +
            '2. Click in the text input area\n' +
            '3. Paste (Ctrl+V or Cmd+V) the content\n' +
            '4. Press Enter to send\n\n' +
            'Click OK to continue.';

          window.alert(message);
        } else {
          // Use React Native Alert for mobile
          Alert.alert(
            'Content Ready for Gemini',
            'Your podcast content has been copied to clipboard.\n\n' +
            '1. Switch to the Gemini tab that just opened\n' +
            '2. Click in the text input area\n' +
            '3. Paste (Ctrl+V or Cmd+V) the content\n' +
            '4. Press Enter to send',
            [{ text: 'Got it!', style: 'default' }]
          );
        }
      }, 1000);

      // Try a simpler, CSP-compliant approach with postMessage
      setTimeout(() => {
        try {
          if (geminiWindow && !geminiWindow.closed) {
            // Send a message to the Gemini window with instructions
            geminiWindow.postMessage({
              type: 'CLIPBOARD_PASTE_INSTRUCTION',
              content: rawContent,
              from: 'podcast-app'
            }, 'https://gemini.google.com');

            console.log('Sent postMessage to Gemini window');
          }
        } catch (postMessageError) {
          console.log('PostMessage failed (expected):', postMessageError);
          // This is expected to fail due to cross-origin restrictions, but worth trying
        }
      }, 2000);

    } catch (error) {
      console.error('Error in Gemini integration:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Could not prepare content for Gemini. Please try again.');
      } else {
        Alert.alert('Error', 'Could not prepare content for Gemini. Please try again.');
      }
    }
  };

  const handleCopyToClipboard = async () => {
    const content = generateSystemPrompt(true, false); // Include sources, don't encode
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(content);
      } else {
        await Clipboard.setStringAsync(content);
      }
      Alert.alert('Success', 'Content copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Could not copy to clipboard. Please try again.');
    }
  };

  const handleTraditionalShare = async () => {
    try {
      // Generate clean content with sources included (no XML tags)
      const cleanContentWithSources = generateCleanContent(true); // Include sources
      
      const shareData = {
        title: contentInfo?.title || 'Educational Content',
        text: cleanContentWithSources,
        url: window.location.href,
      };
      
      if (Platform.OS === 'web' && navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy clean content with sources to clipboard
        if (Platform.OS === 'web') {
          await navigator.clipboard.writeText(cleanContentWithSources);
        } else {
          await Clipboard.setStringAsync(cleanContentWithSources);
        }
        Alert.alert('Success', 'Content with sources copied to clipboard!');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not share content.');
    }
  };

  const shareOptions = [
    {
      id: 'sources',
      title: 'Examine sources',
      subtitle: 'View research references',
      icon: <BookOpen size={16} color="#7C3AED" />,
      action: () => {
        if (onExamineSources) {
          onExamineSources();
        }
      },
    },
    {
      id: 'copy',
      title: 'Copy full content',
      subtitle: 'Copy to clipboard for LLMs',
      icon: <Copy size={16} color="#6B7280" />,
      action: handleCopyToClipboard,
    },
    {
      id: 'gemini',
      title: 'Open in Gemini',
      subtitle: 'Ask questions about this content',
      icon: <Bot size={16} color="#4285F4" />,
      action: () => handleOpenInAI('gemini'),
    },
    {
      id: 'share',
      title: 'Share',
      subtitle: 'Share this content',
      icon: <Share size={16} color="#6B7280" />,
      action: handleTraditionalShare,
    },
  ];

  return (
    <>
      <View className="relative" data-dropdown>
        {/* Main Button */}
        <View className="bg-white rounded-full px-4 py-2 flex-row items-center shadow-sm" ref={buttonRef}>
          <TouchableOpacity
            onPress={handleButtonPress}
            className="flex-row items-center"
            activeOpacity={0.8}
          >
            <BookOpen size={16} color="#374151" strokeWidth={2} />
            <Text className="text-gray-700 text-sm font-medium ml-2">Dive deeper</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal-based Dropdown */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={{
              flex: 1,
            }}
            onPress={() => setIsOpen(false)}
            activeOpacity={1}
          />
          <View
            style={{
              position: 'absolute',
              top: dropdownPosition.y + dropdownPosition.height + 8,
              left: Platform.OS === 'web' 
                ? Math.max(24, Math.min(dropdownPosition.x - 128, window.innerWidth - 280))
                : Math.max(24, dropdownPosition.x - 128), // Mobile: always below button
              backgroundColor: 'white',
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
              minWidth: 256,
              zIndex: 999999,
            }}
            data-dropdown
          >
            <View className="p-2">
              {shareOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    option.action();
                    setIsOpen(false);
                  }}
                  className={`flex-row items-center p-3 rounded-lg ${
                    index === shareOptions.length - 1 ? '' : 'mb-1'
                  } active:bg-gray-50`}
                  style={{ 
                    minHeight: 44,
                  }}
                  activeOpacity={0.7}
                >
                  <View className="mr-3">
                    {option.icon}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">
                      {option.title}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {option.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
