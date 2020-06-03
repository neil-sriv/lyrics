import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.props.navigation.setOptions({
			headerShown: false,
		})
		this.auth = this.props.auth;
		this.state = {};
	}
	
	async componentDidMount() {
		const user = await this.auth.getUserData('user');
		const artists = await this.auth.getUserData('artists');
		const tracks = await this.auth.getUserData('tracks');
		this.setState({
			user: {
				info: JSON.parse(user).display_name,
				image_url: JSON.parse(user).images[0].url,
				artists: [JSON.parse(artists).items[0].name, JSON.parse(artists).items[1].name, JSON.parse(artists).items[2].name],
				tracks: [JSON.parse(tracks).items[0].name, JSON.parse(tracks).items[1].name, JSON.parse(tracks).items[2].name]
			}
		})
		console.log(this.state.user.image_url)
	}

	render() {
		return (
			<View style={styles.container}>
				{this.state.user==null ? <Text> </Text> :
				<View
					style={{alignItems: "center",marginTop: 100}}
				>
					<View style={styles.imageContainer}>
						<Image 
							source={{ uri : this.state.user.image_url }}
							style={{height: 150, width: 150, alignSelf: 'center'}}
						/>							
					</View>
					

					<Text
						style={{ fontSize: 24, marginTop: 10, color: '#2AA7E7'}}
					>
						{this.state.user.name}
					</Text>
					<Text
						style={{ fontSize: 16, }}
					>
						{this.state.user.email}
					</Text>

					<View
						style={{
						marginTop: 20, 
						height: 319,
						width: 319,
						backgroundColor: 'white',
						borderRadius: 15,
						shadowColor: 'black',
						shadowOpacity: 0.35,
						shadowRadius: 10,
						shadowOffset: { width: 0, height: 0 },
					}}
					>
						{/* <Text>{this.state.user.followers}</Text>
						<Text>Followers</Text> */}
						<View
							style={{display:"flex", flexDirection: "row", justifyContent: "space-evenly", marginTop: 20}}
						>
							<View>
								<Text
									style={styles.topHeading}
								>Top Artists</Text>
								<View
									style={styles.topContainer}
								>
									<Text>{this.state.user.artists[0]}</Text>
									<Text>{this.state.user.artists[1]}</Text>
									<Text>{this.state.user.artists[2]}</Text>
								</View>								
							</View>
							<View>
								<Text
									style={styles.topHeading}
								>Top Tracks</Text>
								<View
									style={styles.topContainer}
								>
									<Text>{this.state.user.tracks[0]}</Text>
									<Text>{this.state.user.tracks[1]}</Text>
									<Text>{this.state.user.tracks[2]}</Text>
								</View>		
							</View>


			
						</View>

					</View>

			</View>
		
		}
		</View> 
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		flex: 1,
	},
	imageContainer:{ 
		height: 150,
		width: 150,
		justifyContent: 'center',
		borderColor: 'rgba(42, 167, 231, 0.1)',
		borderWidth: 85,
		borderRadius: 10,
	}
	,
	topHeading:{
		fontWeight: '600', 
		fontSize: 24, 
		marginBottom: 10, 
		color: '#2AA7E7'
	},
	topContainer:{
		display: "flex", 
		flexDirection: "column", 
		alignItems: "center", 
		justifyContent: "space-evenly",
		height: 80
	}

});