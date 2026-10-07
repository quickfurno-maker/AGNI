import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ownerChat } from '@/lib/api';
import { palette, radius } from '@/lib/theme';
import type { ChatEvidenceCard, OwnerChatResponse } from '@/types/owner';

type LocalMessage =
  | { id: string; role: 'USER'; text: string }
  | { id: string; role: 'AGNI'; text: string; response: OwnerChatResponse };

function Evidence({ card }: { card: ChatEvidenceCard }) {
  return (
    <View style={styles.evidence}>
      <Text style={styles.evidenceTitle}>{card.title}</Text>
      {card.lines.slice(0, 8).map((line, index) => (
        <Text key={`${card.id}:${index}`} style={styles.evidenceLine}>
          {line}
        </Text>
      ))}
    </View>
  );
}

export default function ChatScreen() {
  const params = useLocalSearchParams<{ prompt?: string; contextRef?: string }>();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const conversation = useRef<string | undefined>(undefined);
  const consumedPrompt = useRef<string | undefined>(undefined);

  const chat = useMutation({
    mutationFn: ownerChat,
    onSuccess: (response) => {
      conversation.current = response.conversationId;
      setMessages((current) => [
        ...current,
        { id: response.messageId, role: 'AGNI', text: response.reply, response },
      ]);
    },
  });

  const send = useCallback(
    async (
      text: string,
      intent: 'CHAT' | 'INVESTIGATE' | 'PREPARE_FIX' = 'CHAT',
    ) => {
      const query = text.trim();
      if (!query || chat.isPending) return;
      await Haptics.selectionAsync().catch(() => undefined);
      if (intent === 'CHAT') {
        setMessages((current) => [
          ...current,
          { id: `local-${Date.now()}`, role: 'USER', text: query },
        ]);
        setInput('');
      }
      chat.mutate({
        conversationId: conversation.current,
        query,
        contextRef: params.contextRef,
        intent,
      });
    },
    [chat, params.contextRef],
  );

  useEffect(() => {
    if (params.prompt && params.prompt !== consumedPrompt.current) {
      consumedPrompt.current = params.prompt;
      void send(params.prompt);
    }
  }, [params.prompt, send]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={styles.brandIcon}>
            <Ionicons name="sparkles" size={16} color={palette.bg} />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.title}>Ask AGNI</Text>
            <Text style={styles.subtitle}>One conversation across QuickFurno, Jarvis and AGNI</Text>
          </View>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Ask the whole system.</Text>
              <Text style={styles.emptyText}>
                Try “What needs my attention?”, “Why are vendors not getting leads?” or “Check Jarvis and explain anything abnormal.”
              </Text>
              <View style={styles.prompts}>
                {[
                  'What needs my attention right now?',
                  'Check vendor and lead health.',
                  'Are there any security or infrastructure issues?',
                ].map((prompt) => (
                  <Pressable key={prompt} style={styles.prompt} onPress={() => void send(prompt)}>
                    <Text style={styles.promptText}>{prompt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.messageWrap, item.role === 'USER' && styles.userWrap]}>
              <View style={[styles.bubble, item.role === 'USER' ? styles.userBubble : styles.agniBubble]}>
                <Text style={styles.message}>{item.text}</Text>
              </View>
              {item.role === 'AGNI' ? (
                <>
                  {item.response.evidence.map((card) => (
                    <Evidence key={card.id} card={card} />
                  ))}
                  <View style={styles.actions}>
                    <Pressable
                      style={styles.actionSecondary}
                      onPress={() => void send('Investigate this deeper using the available evidence.', 'INVESTIGATE')}
                    >
                      <Text style={styles.actionSecondaryText}>Investigate</Text>
                    </Pressable>
                    <Pressable
                      style={styles.actionPrimary}
                      onPress={() => void send('Prepare the safest bounded repair proposal for this issue.', 'PREPARE_FIX')}
                    >
                      <Text style={styles.actionPrimaryText}>Prepare Fix</Text>
                    </Pressable>
                  </View>
                </>
              ) : null}
            </View>
          )}
        />

        {chat.isPending ? (
          <View style={styles.thinking}>
            <ActivityIndicator color={palette.accent} size="small" />
            <Text style={styles.thinkingText}>AGNI is checking live evidence…</Text>
          </View>
        ) : null}

        {chat.isError ? <Text style={styles.error}>AGNI could not complete that request. No action was executed.</Text> : null}

        <View style={styles.composer}>
          <Pressable accessibilityLabel="Voice mode coming next" style={styles.iconButton}>
            <Ionicons name="mic-outline" size={21} color={palette.muted} />
          </Pressable>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything about QuickFurno…"
            placeholderTextColor={palette.muted}
            multiline
            style={styles.input}
            onSubmitEditing={() => void send(input)}
          />
          <Pressable
            accessibilityLabel="Send"
            onPress={() => void send(input)}
            style={styles.send}
          >
            <Ionicons name="arrow-up" size={20} color={palette.bg} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCopy: { flex: 1 },
  title: { color: palette.text, fontSize: 17, fontWeight: '900' },
  subtitle: { color: palette.muted, fontSize: 10, marginTop: 2 },
  list: { padding: 16, paddingBottom: 26, gap: 14, flexGrow: 1 },
  empty: { flex: 1, minHeight: 500, justifyContent: 'center', gap: 10 },
  emptyTitle: { color: palette.text, fontSize: 28, fontWeight: '900' },
  emptyText: { color: palette.muted, fontSize: 14, lineHeight: 21, maxWidth: 520 },
  prompts: { gap: 8, marginTop: 12 },
  prompt: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: 13,
  },
  promptText: { color: palette.text, fontSize: 13, fontWeight: '700' },
  messageWrap: { alignItems: 'flex-start', gap: 8 },
  userWrap: { alignItems: 'flex-end' },
  bubble: { maxWidth: '88%', borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 11 },
  userBubble: { backgroundColor: palette.surface2 },
  agniBubble: { backgroundColor: palette.accentSoft, borderWidth: 1, borderColor: '#5D4527' },
  message: { color: palette.text, fontSize: 14, lineHeight: 21 },
  evidence: {
    width: '100%',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    padding: 12,
    gap: 4,
  },
  evidenceTitle: { color: palette.text, fontSize: 12, fontWeight: '900', marginBottom: 3 },
  evidenceLine: { color: palette.muted, fontSize: 11, lineHeight: 16 },
  actions: { flexDirection: 'row', gap: 8 },
  actionSecondary: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  actionSecondaryText: { color: palette.text, fontSize: 12, fontWeight: '800' },
  actionPrimary: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: palette.accent,
  },
  actionPrimaryText: { color: palette.bg, fontSize: 12, fontWeight: '900' },
  thinking: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 18, paddingBottom: 8 },
  thinkingText: { color: palette.muted, fontSize: 11 },
  error: { color: palette.red, paddingHorizontal: 18, paddingBottom: 8, fontSize: 11 },
  composer: {
    margin: 12,
    padding: 8,
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
  },
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    color: palette.text,
    fontSize: 14,
    maxHeight: 120,
    minHeight: 38,
    paddingVertical: 9,
  },
  send: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
