import React, {Component, ReactElement} from 'react';

export default class AVOLearnPostTestModel extends React.Component<
    {modalDisplay: 'block' | 'none'; hideModal: () => void},
    any
> {
    constructor(props: any) {
        super(props);
        this.state = {
            styles: {
                modalBackdrop: {
                    position: 'fixed' as 'fixed',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 900000,
                },
                modalBody: {
                    position: 'fixed' as 'fixed',
                    top: '3em',
                    bottom: '3em',
                    right: '20%',
                    left: '20%',
                    padding: '2em 3em',
                    backgroundColor: 'white',
                    overflow: 'auto',
                    zIndex: 900002,
                },
                modalClose: {
                    cursor: 'pointer',
                },
            },
        };
    }
    render() {
        const {styles} = this.state;
        return (
            <div>
                <div
                    style={{
                        display: this.props.modalDisplay,
                        zIndex: 900001,
                    }}
                    id='avo_learn_post_lesson_modal'
                >
                    <div style={styles.modalBackdrop}></div>
                    <div style={styles.modalBody}>
                        <button
                            onClick={event => this.props.hideModal()}
                            style={styles.modalClose}
                            id='close'
                        >
                            Close
                        </button>
                        <h2>Super sick modal</h2>
                    </div>
                </div>
            </div>
        );
    }
}
