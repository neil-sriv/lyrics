import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profile from './Profile';
import Player from './Player';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const PlayerStack = createStackNavigator();

export default class Internal extends React.Component {
	constructor(props) {
		super(props);
		// console.log(this.props);
		this.auth = this.props.auth;
		this.props.navigation.setOptions({
			// title: 'Hello',
			// headerStyle: {
			// 	backgroundColor: 'black',
			// },
			// headerTitleStyle: {
			// 	color: 'white',
			// },
			headerShown: false,
		});
	}

	render() {
		return (
			<Tab.Navigator
				tabBarOptions={{
					activeTintColor: 'tomato',
					inactiveTintColor: 'gray',
                    style: {
                        backgroundColor: 'rgb(15,15,15)'
                    }
				}}
			>
				<Tab.Screen name="Player">
					{(props) => <PlayerStackScreen {...props} auth={this.auth} />}
				</Tab.Screen>
				<Tab.Screen name="Profile">
					{(props) => <Profile {...props} auth={this.auth} />}
				</Tab.Screen>
			</Tab.Navigator>
		);
	}
}

const PlayerStackScreen = (props) => {
	const auth = props.auth;
	return (
		<PlayerStack.Navigator {...props}>
			<PlayerStack.Screen {...props} name="Lyrics">
				{(props) => <Player {...props} auth={auth} />}
			</PlayerStack.Screen>
		</PlayerStack.Navigator>
	);
};
