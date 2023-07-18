// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SlideUpPanelItem from '@components/slide_up_panel_item';

type ThreeDotMenuItemProps = {
    pickerAction: 'manageTeams' | 'createNewTeam' | 'searchTeam' | 'joinTeamByCode';
    onPress: () => void;
};

const ThreeDotMenuItem = ({pickerAction, onPress}: ThreeDotMenuItemProps) => {
    const menuItems = {
        manageTeams: {
            icon: 'settings-outline',
            text: 'Manage Teams',

        },

        createNewTeam: {
            icon: 'plus',
            text: 'Create New Team',

        },

        searchTeam: {
            icon: 'search-list',
            text: 'Search Team',

        },
        joinTeamByCode: {
            icon: 'magnify-plus',
            text: 'Join a Team by code',

        },
    };

    const itemType = menuItems[pickerAction];

    return (
        <SlideUpPanelItem
            {...itemType}
            onPress={onPress}
        />
    );
};

export default ThreeDotMenuItem;
