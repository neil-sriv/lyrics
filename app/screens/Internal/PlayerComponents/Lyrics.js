import React from 'react';
import {
	SafeAreaView,
	ScrollView,
	Text,
	StyleSheet,
	FlatList,
} from 'react-native';

export default class Lyrics extends React.Component {
	flatList = React.createRef();
	constructor(props) {
		super(props);
		this.state = {
			lyrics: this.props.lyrics,
			offset: 0
		};
	}

	componentDidMount() {
		this._stopAutoPlay();
		this._startAutoPlay();
	}

	componentWillUnmount() {
		this._stopAutoPlay();
	}

	_goToNextPage = () => {
		this.flatList.current.scrollToOffset({ offset: this.state.offset });
		this.setState(
			{ offset: this.state.offset+2 }
		)
	};

	_startAutoPlay = () => {
		this._timerId = setInterval(this._goToNextPage, 200);
	};

	_stopAutoPlay = () => {
		if (this._timerId) {
			clearInterval(this._timerId);
			this._timerId = null;
		}
	};

	render() {
		return (
			// <SafeAreaView style={styles.scrollView}>
			// 	<ScrollView
			// 		ref={(ref) => {
			// 			this.scrollView = ref;
			// 		}}
			// 		onContentSizeChange={() =>
			// 			this.scrollView.scrollTo({ x: 0, y: 0, animated: true })
			// 		}
			// 	>
			// 		<Text
			// 			style={{
			// 				color: '#2AA7E7',
			// 				fontSize: 20,
			// 			}}
			// 		>
			// 			{this.state.lyrics}
			// 		</Text>
			// 	</ScrollView>
			// </SafeAreaView>
			<SafeAreaView style={styles.scrollView}>
				<FlatList
					flatListRef={React.createRef()}
					ref={this.flatList}
					data={[{ id: 1, text: this.state.lyrics }]}
					// onContentSizeChange={() =>
					// 	this.flatList.current.scrollToOffset({
					// 		offset: 100,
					// 		animated: true,
					// 	})
					// }
					renderItem={({ item }) => (
						<Text
							style={{
								color: '#2AA7E7',
								fontSize: 20,
							}}
						>
							{this.state.lyrics}
						</Text>
					)}
				/>
			</SafeAreaView>
		);
	}
}

const styles = StyleSheet.create({
	scrollView: {
		// marginHorizontal: 10,
		marginTop: 10,
		height: 300,
		width: 319,
		position: 'relative',
		// backgroundColor: (42, 167, 231, 0.1)
		backgroundColor: 'white',
		borderColor: 'white',
		borderWidth: 10,
		borderRadius: 10,
		shadowColor: 'black',
		shadowOpacity: 0.15,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 0 },
	},
});
