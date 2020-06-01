import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Fontisto } from '@expo/vector-icons';

export default class Controls extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			paused: this.props.paused,
		};
	}

	render() {
		return (
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: this.props.backgroundColor,
					borderColor: 'red',
					borderWidth: 10,
					marginBottom: -30,
				}}
			>
				<TouchableOpacity
					style={styles.playbackButton}
					onPress={this.props.previous}
				>
					<Fontisto name="step-backwrad" size={36} color="white" />
				</TouchableOpacity>
				{this.state.paused ? (
					<TouchableOpacity
						style={styles.playbackButton}
						onPress={() => {
							this.props.play();
							this.setState({ paused: false });
						}}
					>
						<Fontisto name="play" size={36} color="white" />
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						style={styles.playbackButton}
						onPress={() => {
							this.props.pause();
							this.setState({ paused: true });
						}}
					>
						<Fontisto name="pause" size={36} color="white" />
					</TouchableOpacity>
				)}

				<TouchableOpacity
					style={styles.playbackButton}
					onPress={this.props.next}
				>
					<Fontisto name="step-forward" size={36} color="white" />
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	playbackButton: {
		alignItems: 'center',
		paddingLeft: 30,
		paddingRight: 30,
	},
});
