// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';

import CompassIcon from '@components/compass_icon';
import {Screens} from '@constants';
import {useTheme} from '@context/theme';
import {dismissBottomSheet, showModal} from '@screens/navigation';

import PlusMenuSeparator from '../categories_list/header/plus_menu/separator';

import MenuItem from './menu_list/menu_item/menu_item';

type Props = {
    canJoinTeamByCode: boolean;
    canSearchTeam: boolean;
    canCreateTeam: boolean;
}

const MenuList = ({canCreateTeam, canJoinTeamByCode, canSearchTeam}: Props) => {
    const intl = useIntl();
    const theme = useTheme();

    const browseChannels = useCallback(async () => {
        await dismissBottomSheet();

        const title = 'hi';
        const closeButton = CompassIcon.getImageSourceSync('close', 24, theme.sidebarHeaderTextColor);

        showModal(Screens.BROWSE_CHANNELS, title, {
            closeButton,
        });
    }, [intl, theme]);

    const createNewTeam = useCallback(async () => {
        await dismissBottomSheet();

        const title = intl.formatMessage({id: 'mobile.add_team.title', defaultMessage: 'Create a new team'});
        const closeButton = CompassIcon.getImageSourceSync('close', 24, theme.sidebarHeaderTextColor);

        showModal(Screens.CREATE_TEAM, title, {closeButton});
    }, [intl]);

    const openDirectMessage = useCallback(async () => {
        await dismissBottomSheet();

        const title = intl.formatMessage({id: 'create_direct_message.title', defaultMessage: 'Create Direct Message'});
        const closeButton = CompassIcon.getImageSourceSync('close', 24, theme.sidebarHeaderTextColor);
        showModal(Screens.CREATE_DIRECT_MESSAGE, title, {
            closeButton,
        });
    }, [intl, theme]);

    const invitePeopleToTeam = useCallback(async () => {
        await dismissBottomSheet();
        const closeButton = CompassIcon.getImageSourceSync('close', 24, theme.sidebarHeaderTextColor);
        const title = 'Join a Team by code';
        showModal(Screens.JOIN_TEAM, title, {
            closeButton,
        });
    }, [intl, theme]);

    return (
        <>
            {canCreateTeam &&
            <MenuItem
                pickerAction='manageTeams'
                onPress={browseChannels}
            />
            }
            {canSearchTeam &&
            <MenuItem
                pickerAction='createNewTeam'
                onPress={createNewTeam}
            />
            }
            <MenuItem
                pickerAction='searchTeam'
                onPress={openDirectMessage}
            />
            {canJoinTeamByCode &&
            <>
                <PlusMenuSeparator/>
                <MenuItem
                    pickerAction='joinTeamByCode'
                    onPress={invitePeopleToTeam}
                />
            </>
            }
        </>
    );
};

export default MenuList;
