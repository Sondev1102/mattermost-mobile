// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {type StyleProp, View, type ViewStyle} from 'react-native';

import CompassIcon from '@components/compass_icon';
import TouchableWithFeedback from '@components/touchable_with_feedback';
import {useTheme} from '@context/theme';
import {changeOpacity} from '@utils/theme';

type Props = {
    iconColor?: string;
    onPress?: () => void;
    size?: number;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}

const hitSlop = {top: 20, bottom: 5, left: 40, right: 20};

export default function ServerIcon({
    iconColor,
    onPress,
    size = 24,
    style,
    testID,
}: Props) {
    const theme = useTheme();

    return (
        <View style={style}>
            <TouchableWithFeedback
                disabled={onPress === undefined}
                onPress={onPress}
                type='opacity'
                testID={testID}
                hitSlop={hitSlop}
            >
                <CompassIcon
                    size={size}
                    name='menu'
                    color={iconColor || changeOpacity(theme.sidebarHeaderTextColor, 0.56)}
                />
            </TouchableWithFeedback>
        </View>
    );
}

