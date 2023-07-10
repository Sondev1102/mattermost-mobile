// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useIsFocused, useRoute, useTheme} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {useIntl} from 'react-intl';
import {StyleSheet, View, FlatList, ActivityIndicator, DeviceEventEmitter} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {SafeAreaView, type Edge} from 'react-native-safe-area-context';

import {switchToChannelById} from '@actions/remote/channel';
import NavigationHeader from '@app/components/navigation_header';
import RoundedHeaderContext from '@app/components/rounded_header_context';
import {Events, Screens} from '@app/constants';
import {useServerUrl} from '@app/context/server';
import {useIsTablet} from '@app/hooks/device';
import {useCollapsibleHeader} from '@app/hooks/header';

import CategoryBody from '../channel_list/categories_list/categories/body';
import UnreadCategories from '../channel_list/categories_list/categories/unreads';

import EmptyDirectMessages from './components/empty';

import type {CategoryModel, ChannelModel} from '@app/database/models/server';
import type {ViewableItemsChanged} from '@typings/components/post_list';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const EDGES: Edge[] = ['bottom', 'left', 'right'];

type Props = {
    categories: CategoryModel[];
    onlyUnreads: boolean;
    unreadsOnTop: boolean;
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,

    },
    empty: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
});

const DirectMessagesScreen = ({categories, onlyUnreads, unreadsOnTop}: Props) => {
    const theme = useTheme();
    const route = useRoute();
    const {formatMessage} = useIntl();
    const intl = useIntl();
    const title = formatMessage({id: 'channel_list.dms_category', defaultMessage: 'Direct Messages'});
    const isFocused = useIsFocused();
    const serverUrl = useServerUrl();
    const isTablet = useIsTablet();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const opacity = useSharedValue(isFocused ? 1 : 0);
    const params = route.params as {direction: string};
    const teamId = categories[0]?.teamId;
    const toLeft = params.direction === 'left';
    const translateSide = toLeft ? -25 : 25;
    const translateX = useSharedValue(isFocused ? 0 : translateSide);
    const animated = useAnimatedStyle(() => {
        return {
            opacity: withTiming(opacity.value, {duration: 150}),
            transform: [{translateX: withTiming(translateX.value, {duration: 150})}],
        };
    }, []);
    const onSnap = (offset: number) => {
        scrollRef.current?.scrollToOffset({offset, animated: true});
    };
    const {scrollPaddingTop, scrollRef, scrollValue, onScroll, headerHeight} = useCollapsibleHeader<FlatList<string>>(true, onSnap);
    const paddingTop = useMemo(() => ({paddingTop: (scrollPaddingTop + 20), flexGrow: 1}), [scrollPaddingTop]);
    const top = useAnimatedStyle(() => {
        return {
            top: headerHeight.value,
        };
    });

    const onChannelSwitch = useCallback(async (c: Channel | ChannelModel) => {
        switchToChannelById(serverUrl, c.id);
    }, [serverUrl]);

    const categoriesToShow = useMemo(() => {
        if (onlyUnreads && !unreadsOnTop) {
            return ['UNREADS' as const];
        }
        const orderedCategories = [...categories];
        orderedCategories.sort((a, b) => a.sortOrder - b.sortOrder);
        if (unreadsOnTop) {
            return ['UNREADS' as const, ...orderedCategories];
        }
        return [orderedCategories[2]];
    }, [categories, onlyUnreads, unreadsOnTop]);

    const renderCategory = useCallback((data: {item: CategoryModel | 'UNREADS'}) => {
        if (data.item === 'UNREADS') {
            return (
                <UnreadCategories
                    currentTeamId={teamId}
                    isTablet={isTablet}
                    onChannelSwitch={onChannelSwitch}
                    onlyUnreads={onlyUnreads}
                />
            );
        }
        return (
            <>
                <CategoryBody
                    category={data.item}
                    isTablet={isTablet}
                    locale={intl.locale}
                    onChannelSwitch={onChannelSwitch}
                    isOnHome={false}
                />
            </>
        );
    }, [teamId, intl.locale, isTablet, onChannelSwitch, onlyUnreads]);

    const handleRefresh = useCallback(() => {
        // console.log('hi');
    }, []);

    const onViewableItemsChanged = useCallback(({viewableItems}: ViewableItemsChanged) => {
        if (!viewableItems.length) {
            return;
        }

        const viewableItemsMap = viewableItems.reduce((acc: Record<string, boolean>, {item, isViewable}) => {
            if (isViewable && item.type === 'post') {
                acc[`${Screens.MENTIONS}-${item.value.id}`] = true;
            }
            return acc;
        }, {});

        DeviceEventEmitter.emit(Events.ITEM_IN_VIEWPORT, viewableItemsMap);
    }, []);

    const renderEmptyList = useCallback(() => (
        <View style={styles.empty}>
            {loading ? (
                <ActivityIndicator
                    color={theme.colors.background}
                    size='large'
                />
            ) : (
                <EmptyDirectMessages/>
            )}
        </View>
    ), [loading, theme, paddingTop]);

    return (
        <>
            <NavigationHeader
                isLargeTitle={true}
                showBackButton={false}
                subtitle={'All messages you\'ve received'}
                title={title}
                hasSearch={false}
                scrollValue={scrollValue}
            />
            <SafeAreaView
                style={styles.flex}
                edges={EDGES}
            >
                <Animated.View style={[styles.container, animated]}>
                    <Animated.View style={top}>
                        <RoundedHeaderContext/>
                    </Animated.View>
                    <AnimatedFlatList
                        ref={scrollRef}
                        contentContainerStyle={paddingTop}

                        ListEmptyComponent={renderEmptyList()}
                        data={categoriesToShow}
                        scrollToOverflowEnabled={true}
                        showsVerticalScrollIndicator={false}
                        progressViewOffset={scrollPaddingTop}
                        scrollEventThrottle={16}
                        indicatorStyle='black'
                        onScroll={onScroll}
                        onRefresh={handleRefresh}
                        refreshing={refreshing}
                        renderItem={renderCategory}
                        removeClippedSubviews={true}
                        onViewableItemsChanged={onViewableItemsChanged}
                        testID='recent_mentions.post_list.flat_list'
                    />
                </Animated.View>
            </SafeAreaView>
        </>
    );
};

export default DirectMessagesScreen;
