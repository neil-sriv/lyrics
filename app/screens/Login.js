import React from 'react';
import { StyleSheet, View, Button, Alert } from 'react-native';

export default class Login extends React.Component {
	constructor(props) {
		super(props);
		this.auth = this.props.auth;
		this.state = {
			accessTokenAvailable: false,
		};
	}

	async componentDidMount() {
		this.login();
	}

	login = async () => {
		const tokenExpirationTime = await this.auth.getUserData('expirationTime');
		if (
			!tokenExpirationTime ||
			new Date().getTime().toString() > tokenExpirationTime
		) {
			const res = await this.auth.useRefreshToken();
			if (res == 'success') {
				this.setState({ accessTokenAvailable: true });
				await this.profileData();
				this.props.navigation.replace('Internal');
			} else {
				return Alert.alert('Login Cancelled');
			}
		} else {
			this.setState({ accessTokenAvailable: true });
			this.props.navigation.replace('Internal');
		}
	};

	profileData = async () => {
		await this.auth.storeUser();
		await this.auth.storeTopTracks();
		await this.auth.storeTopArtists();
	}

	render() {
		return (
			<View style={styles.container}>
				<Button title="loginhere" onPress={this.login} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
		alignItems: 'center',
		justifyContent: 'center',
		paddingBottom: Platform.OS == 'ios' ? 20 : 0,
		paddingTop: Platform.OS == 'ios' ? 20 : 0,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'black',
	},
	scrollView: {
		backgroundColor: 'black',
		marginHorizontal: 10,
		marginTop: 10,
		height: 250,
		alignSelf: 'stretch',
	},
	imageContainer: {
		backgroundColor: 'black',
		height: 300,
		width: 300,
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: 'black',
		borderWidth: 151,
	},
	playbackButton: {
		alignItems: 'center',
		padding: 10,
	},
	title: {
		alignItems: 'flex-start',
		color: 'white',
		paddingLeft: 30,
		fontSize: 40,
	},
	artist: {
		alignItems: 'flex-start',
		color: 'white',
		paddingLeft: 30,
		fontSize: 20,
	},
});
