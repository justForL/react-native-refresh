
import React, {Component} from 'react';

import PropTypes from 'prop-types';

import {
    ScrollView,
    RefreshControl,
} from 'react-native';


export class SMRefreshScrollView extends Component {

    static propTypes = {
        isRefreshing: PropTypes.bool,
        onRefresh: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            onRefresh: null,
            title: '下拉加载...',
        }
    }

    componentWillReceiveProps(props) {
        if ((typeof (props)) === 'bool') {
            this.state.isRefreshing = props.isRefreshing;
        }
    }

    _onRefresh() {
        this.setState({
            isRefreshing: true,
            title: '加载中...',
        });
        if (this.props.onRefresh) {
            this.props.onRefresh(()=>{
                this.setState({
                    isRefreshing: false,
                    title: '下拉加载...',
                });
            })
        }
    }

    render() {
        return (
            <ScrollView {...this.props}
                        refreshControl={<RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this._onRefresh.bind(this)}
                            tintColor="gray"
                            title={this.state.title}
                            titleColor="#4a4a4a"
                            colors={['#000000']}
                            progressBackgroundColor="#fff"
                        />}
            />
        )
    }

}