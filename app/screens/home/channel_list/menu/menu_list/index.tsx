// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import React, {useCallback, useMemo} from 'react';
import {useIntl} from 'react-intl';
import {FlatList, type ListRenderItemInfo, StyleSheet, View} from 'react-native';

import {useServerUrl} from '@context/server';
import {useTheme} from '@context/theme';
import {useIsTablet} from '@hooks/device';
import BottomSheetContent from '@screens/bottom_sheet/content';
import {addNewServer} from '@utils/server';

import ServerItem from './menu_item';

import type ServersModel from '@typings/database/models/app/servers';

type Props = {
    servers: ServersModel[];
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    contentContainer: {
        marginVertical: 4,
    },
});

const keyExtractor = (item: ServersModel) => item.url;

const ServerList = ({servers}: Props) => {
    const intl = useIntl();
    const isTablet = useIsTablet();
    const serverUrl = useServerUrl();
    const theme = useTheme();

    const onAddServer = useCallback(async () => {
        addNewServer(theme);
    }, [servers]);

    const renderServer = useCallback(({item: t, index}: ListRenderItemInfo<ServersModel>) => {
        return (
            <ServerItem
                highlight={index === 0}
                isActive={t.url === serverUrl}
                server={t}
            />
        );
    }, []);

    const List = useMemo(() => (isTablet ? FlatList : BottomSheetFlatList), [isTablet]);

    return (
        <BottomSheetContent
            buttonIcon='plus'
            buttonText={intl.formatMessage({id: 'servers.create_button', defaultMessage: 'Add a server'})}
            onPress={onAddServer}
            showButton={isTablet}
            showTitle={!isTablet}
            testID='server_list'
            title={intl.formatMessage({id: 'your.servers', defaultMessage: 'Your servers'})}
        >
            <View style={[styles.container, {marginTop: isTablet ? 12 : 0}]}>
                <List
                    data={servers}
                    renderItem={renderServer}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.contentContainer}
                />
            </View>
        </BottomSheetContent>
    );
};

export default ServerList;
