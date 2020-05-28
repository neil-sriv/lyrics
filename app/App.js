import React from 'react';
import {} from 'react-native';
import Auth from './Auth';
import Login from './screens/Login';
import Internal from './screens/Internal/Internal';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
		this.auth = new Auth();
	}

	render() {
		return (
			<NavigationContainer>
				<Stack.Navigator>
					<Stack.Screen name="Login" options={{ title: 'Overview' }}>
						{(props) => <Login {...props} auth={this.auth} />}
					</Stack.Screen>
					<Stack.Screen name="Internal">
						{(props) => <Internal {...props} auth={this.auth} />}
					</Stack.Screen>
				</Stack.Navigator>
			</NavigationContainer>
		);
	}
}
