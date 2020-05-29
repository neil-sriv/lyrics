import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profile from './Profile';
import Player from './Player';

const Tab = createBottomTabNavigator();

export default class Internal extends React.Component {
	constructor(props) {
		super(props);
		// console.log(this.props);
        this.auth = this.props.auth;
        this.props.navigation.setOptions({
            // title: 'Hello',
            headerStyle: {
                backgroundColor: 'black'
            },
            headerTitleStyle: {
                color: 'white'
            }
		});
	}

	render() {
		return (
			<Tab.Navigator>
				<Tab.Screen name="Player">
					{(props) => <Player {...props} auth={this.auth} />}
				</Tab.Screen>
				<Tab.Screen name="Profile">
					{(props) => <Profile {...props} auth={this.auth} />}
				</Tab.Screen>
			</Tab.Navigator>
		);
	}
}
