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
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AgniMark } from '@/components/AgniMark';
import { CommandScreen } from '@/components/CommandScreen';
import { NeonPanel } from '@/components/NeonPanel';
import { StatusChip } from '@/components/StatusChip';
import { ownerChat } from '@/lib/api';
import { fonts, palette, radius } from '@/lib/theme';
import type { ChatEvidenceCard, OwnerChatResponse } from '@/types/owner';

type LocalMessage =
  | { id: string; role: 'USER'; text: string }
  | { id: string; role: 'AGNI'; text: string; response: OwnerChatResponse };

type ChatMode = 'ASK' | 'DIAGNOSE' | 'INVESTIGATE';

const QUICK_PROMPTS = [
  'Summarize today.',
  'What needs my attention?',
  'Show system health.',
  'Where do we need more vendors?',
  'Which areas are oversupplied?',
  'Why are vendors not getting leads?',
] as const;

function Evidence({ card }: { card: ChatEvidenceCard }) {
  return (
    <NeonPanel tone={card.kind === 'INCIDENT' ? 'fire' : 'blue'} style={styles.evidenceWrap}>
      <Text style={styles.evidenceTitle}>{card.title}</Text>
      {card.lines.slice(0, 8).map((line, index) => (
        <Text key={card.id + ':' + index} style={styles.evidenceLine}>• {line}</Text>
      ))}
    </NeonPanel>
  );
}

export default function ChatScreen() {
  const params = useLocalSearchParams<{ prompt?: string; contextRef?: string; intent?: string }>();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ChatMode>('ASK');
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
      forcedIntent?: 'CHAT' | 'INVESTIGATE' | 'PREPARE_FIX',
    ) => {
      const raw = text.trim();
      if (!raw || chat.isPending) return;
      await Haptics.selectionAsync().catch(() => undefined);

      const intent = forcedIntent ?? (mode === 'INVESTIGATE' ? 'INVESTIGATE' : 'CHAT');
      const query = mode === 'DIAGNOSE' && forcedIntent === undefined
        ? 'Run bounded diagnostics using available owner telemetry. Question: ' + raw
        : raw;

      if (forcedIntent !== 'PREPARE_FIX') {
        setMessages((current) => [
          ...current,
          { id: 'local-' + Date.now(), role: 'USER', text: raw },
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
    [chat, mode, params.contextRef],
  );

  useEffect(() => {
    if (params.prompt && params.prompt !== consumedPrompt.current) {
      consumedPrompt.current = params.prompt;
      const forced = params.intent === 'INVESTIGATE' || params.intent === 'PREPARE_FIX'
        ? params.intent
        : undefined;
      void send(params.prompt, forced);
    }
  }, [params.intent, params.prompt, send]);

  return (
    <CommandScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <AgniMark size={38} />
          <View style={styles.headerCopy}>
            <Text style={styles.brand}>AGNI // ASK AGNI</Text>
            <Text style={styles.sub}>OWNER AI OPERATIONS CO-PILOT</Text>
          </View>
          <StatusChip label="ONLINE" tone="green" compact />
        </View>

        <View style={styles.modeBar}>
          {(['ASK', 'DIAGNOSE', 'INVESTIGATE'] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setMode(item)}
              style={[styles.mode, mode === item && styles.modeActive]}
            >
              <Text style={[styles.modeText, mode === item && styles.modeTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.welcomeWrap}>
              <NeonPanel tone="fire">
                <View style={styles.agniLine}>
                  <Ionicons name="flame" size={18} color={palette.fire} />
                  <Text style={styles.agentLabel}>AGNI // READY</Text>
                </View>
                <Text style={styles.welcome}>
                  Hello. I’m AGNI, your private operations co-pilot. Routine questions use lightweight context; deeper telemetry is loaded only when needed.
                </Text>
                <Text style={styles.promptLine}>$ what would you like to know?</Text>
              </NeonPanel>

              <View style={styles.promptGrid}>
                {QUICK_PROMPTS.map((prompt) => (
                  <Pressable key={prompt} style={styles.quickPrompt} onPress={() => void send(prompt)}>
                    <Ionicons name="chevron-forward" size={12} color={palette.blueBright} />
                    <Text style={styles.quickPromptText}>{prompt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.messageWrap, item.role === 'USER' && styles.userWrap]}>
              <View style={[styles.bubble, item.role === 'USER' ? styles.userBubble : styles.agniBubble]}>
                <Text style={styles.role}>{item.role === 'USER' ? 'YOU' : 'AGNI'}</Text>
                <Text style={styles.message}>{item.text}</Text>
                {item.role === 'AGNI' && item.response.safeCode && item.response.safeCode !== 'ANSWERED' ? (
                  <Text style={styles.safeCode}>{'// ' + item.response.safeCode}</Text>
                ) : null}
              </View>

              {item.role === 'AGNI' ? (
                <>
                  {item.response.evidence.map((card) => <Evidence key={card.id} card={card} />)}
                  <View style={styles.actions}>
                    <Pressable
                      style={styles.actionBlue}
                      onPress={() => void send('Investigate this deeper using only relevant evidence.', 'INVESTIGATE')}
                    >
                      <Ionicons name="pulse" size={13} color={palette.blueBright} />
                      <Text style={styles.actionText}>INVESTIGATE</Text>
                    </Pressable>
                    {params.contextRef ? (
                      <Pressable
                        style={styles.actionFire}
                        onPress={() => void send('Prepare the safest bounded repair proposal. Do not execute.', 'PREPARE_FIX')}
                      >
                        <Ionicons name="flash" size={13} color={palette.lightning} />
                        <Text style={styles.actionText}>PREPARE FIX</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </>
              ) : null}
            </View>
          )}
          ListFooterComponent={<View style={{ height: 12 }} />}
        />

        {chat.isPending ? (
          <View style={styles.thinking}>
            <ActivityIndicator color={palette.lightning} size="small" />
            <Text style={styles.thinkingText}>
              {mode === 'ASK' ? '$ routing minimum context...' : '$ correlating relevant telemetry...'}
            </Text>
          </View>
        ) : null}

        {chat.isError ? (
          <Text style={styles.error}>{'// REQUEST FAILED CLOSED. NO ACTION EXECUTED.'}</Text>
        ) : null}

        <View style={styles.voiceRow}>
          <View style={styles.voiceOrb}>
            <Ionicons name="mic" size={19} color={palette.blueBright} />
          </View>
          <View style={styles.voiceCopy}>
            <Text style={styles.voiceTitle}>VOICE LINK // UI READY</Text>
            <Text style={styles.voiceSub}>Realtime voice activation is a later controlled phase.</Text>
          </View>
        </View>

        <View style={styles.composer}>
          <Ionicons name="terminal" size={17} color={palette.cyan} />
          <Text style={styles.promptSymbol}>owner@agni:~$</Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="ask AGNI..."
            placeholderTextColor={palette.dim}
            multiline
            style={styles.input}
            onSubmitEditing={() => void send(input)}
          />
          <Pressable accessibilityLabel="Send" onPress={() => void send(input)} style={styles.send}>
            <Ionicons name="send" size={16} color={palette.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </CommandScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 9,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#17416A',
  },
  headerCopy: { flex: 1 },
  brand: { color: palette.text, fontFamily: fonts.mono, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  sub: { color: palette.blueBright, fontFamily: fonts.mono, fontSize: 7, fontWeight: '800', letterSpacing: 0.8, marginTop: 2 },
  modeBar: { flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  mode: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: '#06111C',
  },
  modeActive: { borderColor: palette.blueBright, backgroundColor: '#0A2342' },
  modeText: { color: palette.muted, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
  modeTextActive: { color: palette.blueBright },
  list: { paddingHorizontal: 14, paddingBottom: 6, gap: 10 },
  welcomeWrap: { gap: 9, marginBottom: 12 },
  agniLine: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 },
  agentLabel: { color: palette.fire, fontFamily: fonts.mono, fontSize: 10, fontWeight: '900' },
  welcome: { color: palette.text, fontFamily: fonts.mono, fontSize: 10, lineHeight: 16 },
  promptLine: { color: palette.cyan, fontFamily: fonts.mono, fontSize: 9, marginTop: 8 },
  promptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  quickPrompt: {
    width: '48.8%',
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#1D5287',
    borderRadius: radius.sm,
    backgroundColor: '#06121E',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  quickPromptText: { flex: 1, color: palette.text, fontFamily: fonts.mono, fontSize: 8, lineHeight: 12 },
  messageWrap: { alignItems: 'flex-start', gap: 7 },
  userWrap: { alignItems: 'flex-end' },
  bubble: { maxWidth: '91%', borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  userBubble: { backgroundColor: '#06245A', borderColor: palette.blueBright },
  agniBubble: { backgroundColor: '#120B08', borderColor: palette.fire },
  role: { color: palette.cyan, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900', marginBottom: 5 },
  message: { color: palette.text, fontFamily: fonts.mono, fontSize: 10, lineHeight: 16 },
  safeCode: { color: palette.lightning, fontFamily: fonts.mono, fontSize: 8, marginTop: 6 },
  evidenceWrap: { width: '100%' },
  evidenceTitle: { color: palette.text, fontFamily: fonts.mono, fontSize: 9, fontWeight: '900', marginBottom: 4 },
  evidenceLine: { color: palette.muted, fontFamily: fonts.mono, fontSize: 8, lineHeight: 13 },
  actions: { flexDirection: 'row', gap: 7 },
  actionBlue: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: palette.blueBright,
    borderRadius: radius.sm,
    backgroundColor: '#07182B',
  },
  actionFire: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: palette.fire,
    borderRadius: radius.sm,
    backgroundColor: '#1A0B05',
  },
  actionText: { color: palette.text, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
  thinking: { flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 15, paddingVertical: 6 },
  thinkingText: { color: palette.lightning, fontFamily: fonts.mono, fontSize: 8 },
  error: { color: palette.red, fontFamily: fonts.mono, fontSize: 8, paddingHorizontal: 15, paddingBottom: 5 },
  voiceRow: {
    marginHorizontal: 14,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#174D80',
    borderRadius: radius.md,
    backgroundColor: '#05101B',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  voiceOrb: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: palette.blueBright,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#071D34',
  },
  voiceCopy: { flex: 1 },
  voiceTitle: { color: palette.blueBright, fontFamily: fonts.mono, fontSize: 8, fontWeight: '900' },
  voiceSub: { color: palette.muted, fontFamily: fonts.mono, fontSize: 7, lineHeight: 11, marginTop: 2 },
  composer: {
    marginHorizontal: 14,
    marginBottom: 86,
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: '#030A11',
    borderWidth: 1,
    borderColor: palette.blueBright,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
  },
  promptSymbol: { color: palette.green, fontFamily: fonts.mono, fontSize: 8, fontWeight: '800' },
  input: { flex: 1, color: palette.text, fontFamily: fonts.mono, fontSize: 10, maxHeight: 90, minHeight: 38, paddingVertical: 8 },
  send: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: palette.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
