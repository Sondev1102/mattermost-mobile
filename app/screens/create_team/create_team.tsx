// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useReducer, useState} from 'react';
import {useIntl} from 'react-intl';
import {Keyboard} from 'react-native';

import {createTeam} from '@actions/remote/team';
import CompassIcon from '@components/compass_icon';
import {General} from '@constants';
import {MIN_CHANNEL_NAME_LENGTH} from '@constants/channel';
import {useServerUrl} from '@context/server';
import {useTheme} from '@context/theme';
import useAndroidHardwareBackHandler from '@hooks/android_back_handler';
import useNavButtonPressed from '@hooks/navigation_button_pressed';
import {buildNavigationButton, dismissModal, popTopScreen, setButtons} from '@screens/navigation';
import {validateDisplayName} from '@utils/channel';

import CreateTeamForm from './create_team_form';

import type ChannelModel from '@typings/database/models/servers/channel';
import type {AvailableScreens} from '@typings/screens/navigation';
import type {ImageResource} from 'react-native-navigation';

type Props = {
    componentId: AvailableScreens;
    channel?: ChannelModel;
    isModal: boolean;
}

const CLOSE_BUTTON_ID = 'close-team';
const CREATE_BUTTON_ID = 'create-team';

enum RequestActions {
    START = 'Start',
    COMPLETE = 'Complete',
    FAILURE = 'Failure',
}

interface RequestState {
    error: string;
    saving: boolean;
}

interface RequestAction {
    type: RequestActions;
    error?: string;
}

const close = (componentId: AvailableScreens, isModal: boolean): void => {
    Keyboard.dismiss();
    if (isModal) {
        dismissModal({componentId});
    } else {
        popTopScreen(componentId);
    }
};

const isDirect = (channel?: ChannelModel): boolean => {
    return channel?.type === General.DM_CHANNEL || channel?.type === General.GM_CHANNEL;
};

const makeCloseButton = (icon: ImageResource) => {
    return buildNavigationButton(CLOSE_BUTTON_ID, 'close.create_or_edit_channel.button', icon);
};

const CreateTeam = ({
    componentId,
    channel,
    isModal = true,
}: Props) => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const theme = useTheme();
    const serverUrl = useServerUrl();

    const editing = Boolean(channel);

    const [canSave, setCanSave] = useState(false);

    const [displayName, setDisplayName] = useState<string>('');

    const [appState, dispatch] = useReducer((state: RequestState, action: RequestAction) => {
        switch (action.type) {
            case RequestActions.START:
                return {
                    error: '',
                    saving: true,
                };
            case RequestActions.COMPLETE:
                return {
                    error: '',
                    saving: false,
                };
            case RequestActions.FAILURE:
                return {
                    error: action.error,
                    saving: false,
                };

            default:
                return state;
        }
    }, {
        error: '',
        saving: false,
    });

    const rightButton = useMemo(() => {
        const base = buildNavigationButton(CREATE_BUTTON_ID,
            editing ? 'create_or_edit_channel.save.button' : 'create_or_edit_channel.create.button',
            undefined,
            editing ? formatMessage({id: 'mobile.edit_channel', defaultMessage: 'Save'}) : formatMessage({id: 'mobile.create_channel', defaultMessage: 'Create'}),
        );
        base.enabled = canSave;
        base.showAsAction = 'always';
        base.color = theme.sidebarHeaderTextColor;
        return base;
    }, [editing, theme.sidebarHeaderTextColor, intl, canSave]);

    useEffect(() => {
        setButtons(componentId, {
            rightButtons: [rightButton],
        });
    }, [rightButton, componentId]);

    useEffect(() => {
        if (isModal) {
            const icon = CompassIcon.getImageSourceSync('close', 24, theme.sidebarHeaderTextColor);
            setButtons(componentId, {
                leftButtons: [makeCloseButton(icon)],
            });
        }
    }, [theme, isModal]);

    useEffect(() => {
        setCanSave(
            displayName.length >= MIN_CHANNEL_NAME_LENGTH && (
                displayName !== channel?.displayName
            ),
        );
    }, [channel, displayName]);

    const isValidDisplayName = useCallback((): boolean => {
        if (isDirect(channel)) {
            return true;
        }

        const result = validateDisplayName(intl, displayName);
        if (result.error) {
            dispatch({
                type: RequestActions.FAILURE,
                error: result.error,
            });
            return false;
        }
        return true;
    }, [channel, displayName]);

    const onCreateTeam = useCallback(async () => {
        dispatch({type: RequestActions.START});
        Keyboard.dismiss();
        if (!isValidDisplayName()) {
            return;
        }

        setCanSave(false);
        const createdTeam = await createTeam(serverUrl, displayName, 'O');
        if (createdTeam.error) {
            dispatch({
                type: RequestActions.FAILURE,
                error: createdTeam.error as string,
            });
            return;
        }

        dispatch({type: RequestActions.COMPLETE});
        close(componentId, isModal);
    }, [serverUrl, displayName, isModal, isValidDisplayName]);

    const handleClose = useCallback(() => {
        close(componentId, isModal);
    }, [isModal]);

    useNavButtonPressed(CLOSE_BUTTON_ID, componentId, handleClose, [handleClose]);
    useNavButtonPressed(CREATE_BUTTON_ID, componentId, onCreateTeam, [onCreateTeam]);
    useAndroidHardwareBackHandler(componentId, handleClose);

    return (
        <CreateTeamForm
            error={appState.error}
            saving={appState.saving}
            channelType={channel?.type}
            displayName={displayName}
            onDisplayNameChange={setDisplayName}
        />
    );
};

export default CreateTeam;
