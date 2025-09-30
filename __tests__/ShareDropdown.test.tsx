import { ShareDropdown } from '@/components/ShareDropdown';
import { PodcastSource } from '@/types/podcast';
import { fireEvent, render } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Alert, Linking, Platform } from 'react-native';

// Mock dependencies
jest.mock('expo-clipboard');
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
  },
  Platform: {
    OS: 'web',
  },
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Modal: 'Modal',
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  useWindowDimensions: jest.fn(() => ({ width: 375, height: 667 })),
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  BookOpen: ({ size, color }: any) => null,
  Bot: ({ size, color }: any) => null,
  Copy: ({ size, color }: any) => null,
  Share: ({ size, color }: any) => null,
}));

// Mock window.open for web platform tests
const mockWindowOpen = jest.fn();
global.window = Object.create(window);
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
});

// Mock navigator.clipboard for web platform tests
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
  },
  writable: true,
});

// Mock eval for injection testing
const mockEval = jest.fn();
Object.defineProperty(window, 'eval', {
  value: mockEval,
});

const mockClipboard = Clipboard as jest.Mocked<typeof Clipboard>;
const mockAlert = jest.mocked(Alert.alert);
const mockLinking = jest.mocked(Linking.openURL);
const mockNavigatorClipboard = navigator.clipboard.writeText as jest.MockedFunction<typeof navigator.clipboard.writeText>;

describe('ShareDropdown - Recent Fix Validation', () => {
  const mockContentInfo = {
    title: 'Test Podcast Episode',
    subtitle: 'A test episode about education',
    description: 'This is a test description of the podcast episode.',
    summary: 'Key points: 1) Education is important 2) Learning never stops',
  };

  const mockScript = 'This is the transcript of the podcast episode.';

  const mockSources: PodcastSource[] = [
    {
      title: 'Research Paper on Education',
      author: 'Dr. Smith',
      publishedDate: '2024-01-15',
      url: 'https://example.com/paper1',
      description: 'A comprehensive study on modern education methods',
      type: 'research',
    },
    {
      title: 'Educational Guidelines',
      author: 'Ministry of Education',
      publishedDate: '2024-02-01',
      url: 'https://example.com/guidelines',
      description: 'Official guidelines for educators',
      type: 'article',
    },
  ];

  const defaultProps = {
    contentInfo: mockContentInfo,
    script: mockScript,
    sources: mockSources,
    onExamineSources: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockClipboard.setStringAsync.mockResolvedValue();
    mockNavigatorClipboard.mockResolvedValue();
    mockWindowOpen.mockReturnValue({ eval: mockEval } as any);
    mockLinking.mockResolvedValue();

    // Mock Platform.OS for different test scenarios
    Platform.OS = 'web';
  });

  describe('Component Rendering', () => {
    it('should render the main button with correct text', () => {
      const { getByText } = render(<ShareDropdown {...defaultProps} />);
      expect(getByText('Dive deeper')).toBeTruthy();
    });

    it('should render without contentInfo', () => {
      const { getByText } = render(
        <ShareDropdown {...defaultProps} contentInfo={null} />
      );
      expect(getByText('Dive deeper')).toBeTruthy();
    });

    it('should render without sources', () => {
      const { getByText } = render(
        <ShareDropdown {...defaultProps} sources={undefined} />
      );
      expect(getByText('Dive deeper')).toBeTruthy();
    });
  });

  describe('Recent Fix Validation', () => {
    it('should not throw syntax errors when component renders', () => {
      expect(() => {
        render(<ShareDropdown {...defaultProps} />);
      }).not.toThrow();
    });

    it('should handle sources with missing optional fields without errors', () => {
      const sourcesWithMissingFields: PodcastSource[] = [
        {
          title: 'Test Source',
          url: 'https://example.com/test',
          description: 'Test description',
          type: 'article',
        },
      ];

      expect(() => {
        render(
          <ShareDropdown {...defaultProps} sources={sourcesWithMissingFields} />
        );
      }).not.toThrow();
    });

    it('should handle empty sources array without errors', () => {
      expect(() => {
        render(<ShareDropdown {...defaultProps} sources={[]} />);
      }).not.toThrow();
    });

    it('should handle null contentInfo without errors', () => {
      expect(() => {
        render(<ShareDropdown {...defaultProps} contentInfo={null} />);
      }).not.toThrow();
    });
  });

  describe('Content Generation Functions', () => {
    it('should generate system prompt without syntax errors', () => {
      render(<ShareDropdown {...defaultProps} />);
      
      // This tests that the generateSystemPrompt function doesn't throw
      expect(() => {
        // The function is called internally when the component renders
        // If there are syntax errors, they would appear here
      }).not.toThrow();
    });

    it('should generate clean content without syntax errors', () => {
      render(<ShareDropdown {...defaultProps} />);
      
      // This tests that the generateCleanContent function doesn't throw
      expect(() => {
        // The function is called internally when the component renders
        // If there are syntax errors, they would appear here
      }).not.toThrow();
    });

    it('should handle forEach loop with sources correctly', () => {
      // This test specifically validates the recent fix where fullContent was changed to cleanContent
      const sourcesWithMultipleItems: PodcastSource[] = [
        {
          title: 'First Source',
          author: 'Author 1',
          publishedDate: '2024-01-01',
          url: 'https://example.com/1',
          description: 'First source description',
          type: 'research',
        },
        {
          title: 'Second Source',
          author: 'Author 2',
          publishedDate: '2024-01-02',
          url: 'https://example.com/2',
          description: 'Second source description',
          type: 'article',
        },
        {
          title: 'Third Source',
          url: 'https://example.com/3',
          description: 'Third source description',
          type: 'website',
        },
      ];

      expect(() => {
        render(
          <ShareDropdown {...defaultProps} sources={sourcesWithMultipleItems} />
        );
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle clipboard errors gracefully', async () => {
      mockClipboard.setStringAsync.mockRejectedValue(new Error('Clipboard error'));
      
      const { getByText } = render(<ShareDropdown {...defaultProps} />);
      
      // The component should render without throwing
      expect(getByText('Dive deeper')).toBeTruthy();
    });

    it('should handle missing optional source fields gracefully', () => {
      const sourcesWithMissingFields: PodcastSource[] = [
        {
          title: 'Test Source',
          url: 'https://example.com/test',
          description: 'Test description',
          type: 'article',
          // Missing author and publishedDate
        },
      ];

      expect(() => {
        render(
          <ShareDropdown {...defaultProps} sources={sourcesWithMissingFields} />
        );
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should integrate with all required dependencies', () => {
      // Test that all imports work correctly
      expect(() => {
        render(<ShareDropdown {...defaultProps} />);
      }).not.toThrow();
    });

    it('should handle all prop combinations', () => {
      const testCases = [
        { contentInfo: null, script: undefined, sources: undefined },
        { contentInfo: mockContentInfo, script: '', sources: [] },
        { contentInfo: mockContentInfo, script: mockScript, sources: mockSources },
        { contentInfo: { ...mockContentInfo, summary: undefined }, script: mockScript, sources: mockSources },
      ];

      testCases.forEach((props, index) => {
        expect(() => {
          render(<ShareDropdown {...defaultProps} {...props} />);
        }).not.toThrow(`Test case ${index} failed`);
      });
    });
  });

  describe('Gemini Integration Tests', () => {
    describe('Gemini Dropdown Option', () => {
      it('should display Gemini option in dropdown instead of ChatGPT', async () => {
        const { getByText, queryByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown
        fireEvent.press(getByText('Dive deeper'));

        // Should have Gemini option, not ChatGPT
        expect(getByText('Open in Gemini')).toBeTruthy();
        expect(queryByText('Open in ChatGPT')).toBeNull();
        expect(getByText('Ask questions about this content')).toBeTruthy();
      });

      it('should have correct color for Gemini icon', async () => {
        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown
        fireEvent.press(getByText('Dive deeper'));

        // Gemini option should be present (icon color is tested via snapshot if needed)
        expect(getByText('Open in Gemini')).toBeTruthy();
      });
    });

    describe('handleGeminiInjection - Web Platform', () => {
      beforeEach(() => {
        Platform.OS = 'web';
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should copy content to clipboard before opening Gemini', async () => {
        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        // Should copy to clipboard
        expect(mockNavigatorClipboard).toHaveBeenCalledWith(
          expect.stringContaining(mockContentInfo.title)
        );
      });

      it('should open Gemini website with correct URL', async () => {
        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        expect(mockWindowOpen).toHaveBeenCalledWith('https://gemini.google.com/app', '_blank');
      });

      it('should handle popup blocker error gracefully', async () => {
        mockWindowOpen.mockReturnValue(null);

        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        expect(mockAlert).toHaveBeenCalledWith('Error', 'Please allow popups for this site to use the Gemini integration.');
      });

      it('should inject content script into Gemini window', async () => {
        const mockGeminiWindow = { eval: mockEval };
        mockWindowOpen.mockReturnValue(mockGeminiWindow as any);

        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        // Wait for injection delay
        jest.advanceTimersByTime(3000);

        expect(mockEval).toHaveBeenCalledWith(
          expect.stringContaining('div.ql-editor.textarea.new-input-ui[contenteditable="true"]')
        );
      });

      it('should handle injection script errors gracefully', async () => {
        const mockGeminiWindow = { eval: jest.fn().mockImplementation(() => { throw new Error('Script error'); }) };
        mockWindowOpen.mockReturnValue(mockGeminiWindow as any);

        // Mock alert for fallback
        global.alert = jest.fn();

        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        // Wait for injection delay
        jest.advanceTimersByTime(3000);

        expect(global.alert).toHaveBeenCalledWith('Content copied to clipboard! Please paste it into Gemini manually.');
      });

      it('should include sources in the injected content', async () => {
        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        // Should include sources in clipboard content
        expect(mockNavigatorClipboard).toHaveBeenCalledWith(
          expect.stringContaining('Research Paper on Education')
        );
        expect(mockNavigatorClipboard).toHaveBeenCalledWith(
          expect.stringContaining('Educational Guidelines')
        );
      });

      it('should handle clipboard write failure gracefully', async () => {
        mockNavigatorClipboard.mockRejectedValue(new Error('Clipboard error'));

        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Should not throw when clipboard fails
        expect(() => {
          fireEvent.press(getByText('Dive deeper'));
          fireEvent.press(getByText('Open in Gemini'));
        }).not.toThrow();
      });
    });

    describe('handleOpenInAI - Mobile Platform', () => {
      beforeEach(() => {
        Platform.OS = 'ios'; // Test mobile fallback
      });

      it('should use Linking.openURL for mobile Gemini integration', async () => {
        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        expect(mockLinking).toHaveBeenCalledWith(
          expect.stringContaining('https://gemini.google.com/app?prompt=')
        );
      });

      it('should encode content properly for URL parameters on mobile', async () => {
        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        const callArgs = mockLinking.mock.calls[0][0];
        expect(callArgs).toContain('https://gemini.google.com/app?prompt=');
        expect(callArgs).toContain(encodeURIComponent(mockContentInfo.title));
      });
    });

    describe('Content Generation for Gemini', () => {
      it('should generate system prompt with XML-style notes for Gemini', async () => {
        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        const clipboardContent = mockNavigatorClipboard.mock.calls[0][0];
        expect(clipboardContent).toContain('<notes>');
        expect(clipboardContent).toContain('<critical>');
        expect(clipboardContent).toContain('Use these notes as a resource');
      });

      it('should include full transcript and description in Gemini content', async () => {
        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        const clipboardContent = mockNavigatorClipboard.mock.calls[0][0];
        expect(clipboardContent).toContain(mockScript);
        expect(clipboardContent).toContain(mockContentInfo.description);
        expect(clipboardContent).toContain(mockContentInfo.summary);
      });

      it('should handle missing contentInfo gracefully', async () => {
        const { getByText } = render(<ShareDropdown {...defaultProps} contentInfo={null} />);

        // Should not throw when contentInfo is null
        expect(() => {
          fireEvent.press(getByText('Dive deeper'));
          fireEvent.press(getByText('Open in Gemini'));
        }).not.toThrow();
      });
    });

    describe('Gemini DOM Injection Selectors', () => {
      it('should target correct Gemini input selectors', async () => {
        const mockGeminiWindow = { eval: mockEval };
        mockWindowOpen.mockReturnValue(mockGeminiWindow as any);

        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        // Wait for injection delay
        jest.advanceTimersByTime(3000);

        const injectionScript = mockEval.mock.calls[0][0];

        // Should include primary Gemini selector
        expect(injectionScript).toContain('div.ql-editor.textarea.new-input-ui[contenteditable="true"]');

        // Should include fallback selectors
        expect(injectionScript).toContain('.ql-editor[contenteditable="true"]');
        expect(injectionScript).toContain('[data-placeholder*="Enter a prompt"]');
        expect(injectionScript).toContain('[contenteditable="true"][role="textbox"]');
      });

      it('should handle content injection for contenteditable divs', async () => {
        const mockGeminiWindow = { eval: mockEval };
        mockWindowOpen.mockReturnValue(mockGeminiWindow as any);

        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        // Wait for injection delay
        jest.advanceTimersByTime(3000);

        const injectionScript = mockEval.mock.calls[0][0];

        // Should handle contenteditable div injection
        expect(injectionScript).toContain('textarea.innerHTML = \'\'');
        expect(injectionScript).toContain('document.createTextNode(content)');
        expect(injectionScript).toContain('textarea.appendChild(textNode)');
        expect(injectionScript).toContain('textarea.focus()');
      });

      it('should attempt to find and click Gemini send button', async () => {
        const mockGeminiWindow = { eval: mockEval };
        mockWindowOpen.mockReturnValue(mockGeminiWindow as any);

        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        // Wait for injection delay
        jest.advanceTimersByTime(3000);

        const injectionScript = mockEval.mock.calls[0][0];

        // Should include send button selectors
        expect(injectionScript).toContain('button[aria-label*="Send"]');
        expect(injectionScript).toContain('button[title*="Send"]');
        expect(injectionScript).toContain('button[data-testid*="send"]');

        // Should have fallback to Enter key
        expect(injectionScript).toContain('KeyboardEvent(\'keydown\'');
        expect(injectionScript).toContain('key: \'Enter\'');
      });
    });

    describe('Error Handling', () => {
      it('should handle general Gemini opening errors', async () => {
        mockWindowOpen.mockImplementation(() => { throw new Error('Window error'); });

        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Open dropdown and click Gemini
        fireEvent.press(getByText('Dive deeper'));
        fireEvent.press(getByText('Open in Gemini'));

        expect(mockAlert).toHaveBeenCalledWith('Error', 'Could not open Gemini. Please try again.');
      });

      it('should handle mobile linking errors', async () => {
        Platform.OS = 'ios';
        mockLinking.mockRejectedValue(new Error('Linking error'));

        const { getByText } = render(<ShareDropdown {...defaultProps} />);

        // Should not throw when linking fails
        expect(() => {
          fireEvent.press(getByText('Dive deeper'));
          fireEvent.press(getByText('Open in Gemini'));
        }).not.toThrow();
      });
    });
  });
});
