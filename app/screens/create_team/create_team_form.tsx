// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
    type LayoutChangeEvent,
    TextInput,
    TouchableWithoutFeedback,
    StatusBar,
    View,
    type NativeSyntheticEvent,
    type NativeScrollEvent,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';

import ErrorText from '@components/error_text';
import FloatingTextInput from '@components/floating_text_input_label';
import FormattedText from '@components/formatted_text';
import Loading from '@components/loading';
import {General, Channel} from '@constants';
import {useTheme} from '@context/theme';
import {useKeyboardHeight} from '@hooks/device';
import {
    changeOpacity,
    makeStyleSheetFromTheme,
    getKeyboardAppearanceFromTheme,
} from '@utils/theme';
import {typography} from '@utils/typography';

const FIELD_MARGIN_BOTTOM = 24;
const MAKE_PRIVATE_MARGIN_BOTTOM = 32;
const LIST_PADDING = 32;

const getStyleSheet = makeStyleSheetFromTheme((theme) => ({
    container: {
        flex: 1,
    },
    scrollView: {
        paddingVertical: LIST_PADDING,
        paddingHorizontal: 20,
    },
    errorContainer: {
        width: '100%',
    },
    errorWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    makePrivateContainer: {
        marginBottom: MAKE_PRIVATE_MARGIN_BOTTOM,
    },
    fieldContainer: {
        marginBottom: FIELD_MARGIN_BOTTOM,
    },
    helpText: {
        ...typography('Body', 75, 'Regular'),
        color: changeOpacity(theme.centerChannelColor, 0.5),
        marginTop: 8,
        marginBottom: 16,
    },
    title: {
        ...typography('Body', 100, 'Regular'),
        color: changeOpacity(theme.centerChannelColor, 0.5),
        marginTop: 8,
        marginBottom: 16,
        fontSize: 20,
    },
}));

type Props = {
    channelType?: string;
    displayName: string;
    onDisplayNameChange: (text: string) => void;
    error?: string | object;
    headerOnly?: boolean;
    saving: boolean;
}

export default function CreateTeamForm({
    channelType,
    displayName,
    onDisplayNameChange,
    error,
    headerOnly,
    saving,
}: Props) {
    const theme = useTheme();
    const styles = getStyleSheet(theme);

    const nameInput = useRef<TextInput>(null);
    const purposeInput = useRef<TextInput>(null);
    const headerInput = useRef<TextInput>(null);

    const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

    const updateScrollTimeout = useRef<NodeJS.Timeout>();

    const mainView = useRef<View>(null);

    const keyboardHeight = useKeyboardHeight();
    const [keyboardVisible, setKeyBoardVisible] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);

    const [wrapperHeight, setWrapperHeight] = useState(0);
    const [errorHeight, setErrorHeight] = useState(0);
    const [displayNameFieldHeight, setDisplayNameFieldHeight] = useState(0);

    const labelDisplayName = 'Team Name';

    const placeholderDisplayName = 'Name of the Team';

    const displayHeaderOnly = headerOnly || channelType === General.DM_CHANNEL || channelType === General.GM_CHANNEL;

    const blur = useCallback(() => {
        nameInput.current?.blur();
        purposeInput.current?.blur();
        headerInput.current?.blur();
        scrollViewRef.current?.scrollToPosition(0, 0, true);
    }, []);

    const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const pos = e.nativeEvent.contentOffset.y;
        if (updateScrollTimeout.current) {
            clearTimeout(updateScrollTimeout.current);
        }
        updateScrollTimeout.current = setTimeout(() => {
            setScrollPosition(pos);
            updateScrollTimeout.current = undefined;
        }, 200);
    }, []);

    useEffect(() => {
        if (keyboardVisible && !keyboardHeight) {
            setKeyBoardVisible(false);
        }
        if (!keyboardVisible && keyboardHeight) {
            setKeyBoardVisible(true);
        }
    }, [keyboardHeight]);

    const onLayoutError = useCallback((e: LayoutChangeEvent) => {
        setErrorHeight(e.nativeEvent.layout.height);
    }, []);
    const onLayoutDisplayName = useCallback((e: LayoutChangeEvent) => {
        setDisplayNameFieldHeight(e.nativeEvent.layout.height);
    }, []);
    const onLayoutWrapper = useCallback((e: LayoutChangeEvent) => {
        setWrapperHeight(e.nativeEvent.layout.height);
    }, []);

    if (saving) {
        return (
            <View style={styles.container}>
                <StatusBar/>
                <Loading
                    containerStyle={styles.loading}
                    color={theme.centerChannelColor}
                    size='large'
                />
            </View>
        );
    }

    let displayError;
    if (error) {
        displayError = (
            <SafeAreaView
                edges={['bottom', 'left', 'right']}
                style={styles.errorContainer}
                onLayout={onLayoutError}
            >
                <View style={styles.errorWrapper}>
                    <ErrorText
                        testID='edit_channel_info.error.text'
                        error={error}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            edges={['bottom', 'left', 'right']}
            style={styles.container}
            testID='create_or_edit_channel.screen'
            onLayout={onLayoutWrapper}
            ref={mainView}
        >
            <KeyboardAwareScrollView
                testID={'create_or_edit_channel.scroll_view'}
                ref={scrollViewRef}
                keyboardShouldPersistTaps={'always'}
                enableAutomaticScroll={!keyboardVisible}
                contentContainerStyle={styles.scrollView}
                onScroll={onScroll}
            >
                {displayError}
                <TouchableWithoutFeedback
                    onPress={blur}
                >
                    <View>
                        <FormattedText
                            style={styles.title}
                            id='team_modal.title'
                            defaultMessage='All team communication in one place, searchable and accessible anywhere.'
                        />
                        {!displayHeaderOnly && (
                            <>
                                <FloatingTextInput
                                    autoCorrect={false}
                                    autoCapitalize={'none'}
                                    blurOnSubmit={false}
                                    disableFullscreenUI={true}
                                    enablesReturnKeyAutomatically={true}
                                    label={labelDisplayName}
                                    placeholder={placeholderDisplayName}
                                    onChangeText={onDisplayNameChange}
                                    maxLength={Channel.MAX_CHANNEL_NAME_LENGTH}
                                    keyboardAppearance={getKeyboardAppearanceFromTheme(theme)}
                                    returnKeyType='next'
                                    showErrorIcon={false}
                                    spellCheck={false}
                                    value={displayName}
                                    ref={nameInput}
                                    containerStyle={styles.fieldContainer}
                                    theme={theme}
                                    onLayout={onLayoutDisplayName}
                                />
                            </>
                        )}
                        <View
                            style={styles.fieldContainer}
                        >
                            <FormattedText
                                style={styles.helpText}
                                id='team_modal.description'
                                defaultMessage={'Name your team in any language. Your team name shows in menus and headings.'}

                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
