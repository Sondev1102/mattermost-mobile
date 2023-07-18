// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useImperativeHandle} from 'react';
import {StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ITEM_HEIGHT} from '@app/components/slide_up_panel_item';
import {SEPARATOR_HEIGHT} from '@app/screens/channel/header/quick_actions';
import ServerIcon from '@components/server_icon';
import {useTheme} from '@context/theme';
import {useIsTablet} from '@hooks/device';
import {bottomSheet} from '@screens/navigation';
import {bottomSheetSnapPoint} from '@utils/helpers';

import MenuList from './menu';

export type ServersRef = {
    openServers: () => void;
}

export const SERVER_ITEM_HEIGHT = 72;

const styles = StyleSheet.create({
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        zIndex: 10,
        top: 10,
        left: 16,
        width: 40,
        height: 40,
    },
});

const Menu = React.forwardRef<ServersRef>((_, ref) => {
    const isTablet = useIsTablet();
    const {bottom} = useSafeAreaInsets();
    const theme = useTheme();

    const onPress = useCallback(() => {
        const renderContent = () => {
            return (
                <MenuList
                    canCreateTeam={true}
                    canSearchTeam={true}
                    canJoinTeamByCode={true}
                />
            );
        };

        const closeButtonId = 'close-your-servers';
        bottomSheet({
            closeButtonId,
            renderContent,
            snapPoints: [1, bottomSheetSnapPoint(4, ITEM_HEIGHT, bottom) + (SEPARATOR_HEIGHT)],
            theme,
            title: '',
        });
    }, [bottom, isTablet, theme]);

    useImperativeHandle(ref, () => ({
        openServers: onPress,
    }), [onPress]);

    return (
        <ServerIcon
            onPress={onPress}
            style={styles.icon}
        />
    );
});

Menu.displayName = 'Servers';

export default Menu;
