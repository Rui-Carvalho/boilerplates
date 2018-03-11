import React, {Component} from 'react';
import SignUp from "./signup";

export default class StripeLikeMenu extends Component {

    constructor(props)
    {
        super(props);
        this.state = {
            device : null,
            dropDownList: {
                activeClass: '',
                style: null,
                menusOrder: [],
                menusClass: {}
            },
            bgLayerStyle: null,
            hamburguerMenuClass: ''
        };
    }

    componentDidMount()
    {
        this.setDevice();
        window.addEventListener("resize", this.resetDropDown.bind(this)); //USING DEBOUNCE: _.debounce(() => { this.resetDropDown()}, 200)
        this.setDropDownListMenusOrderAndClasses();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resetDropDown.bind(this));
    }

    setDropDownListMenusOrderAndClasses()
    {
        let els = document.querySelectorAll('.dropdown-list > ul > li'),
            newState = {...this.state};

        newState.dropDownList.menusOrder = Object.keys(els).map((i) => {
            let contentName = els[i].dataset.content;
            newState.dropDownList.menusClass[contentName] = '';
            return contentName;
        });
        this.setState(newState);
    }

    setDevice()
    {
        this.state.device = window
            .getComputedStyle(document.querySelector('.stripe-dropdown'), '::before')
            .getPropertyValue('content')
            .replace(/'/g, "").replace(/"/g, "")
            .split(', ')[0] || "desktop"; // mobile || desktop ==> see CSS ::before styling for stripe-dropdown => uses media queries
    }

    updateDropDownPosition(height, width, left)
    {
        this.state.dropDownList.style = {
                    'MozTransform': 'translateX(' + left + 'px)',
                    'WebkitTransform': 'translateX(' + left + 'px)',
                    'msTransform': 'translateX(' + left + 'px)',
                    'OTransform': 'translateX(' + left + 'px)',
                    'transform': 'translateX(' + left + 'px)',
                    'width': width + 'px',
                    'height': height + 'px'
                };
        this.state.bgLayerStyle = {
                'MozTransform': 'scaleX(' + width + ') scaleY(' + height + ')',
                'WebkitTransform': 'scaleX(' + width + ') scaleY(' + height + ')',
                'msTransform': 'scaleX(' + width + ') scaleY(' + height + ')',
                'OTransform': 'scaleX(' + width + ') scaleY(' + height + ')',
                'transform': 'scaleX(' + width + ') scaleY(' + height + ')'
            };
    }

    resetDropDown()
    {
        if( this.state.device === 'mobile') {
            this.setState({ ...this.state,
                dropDownList: { ...this.state.dropDownList,
                    style: null
                }
            });
        }
    }

    showDropDown(event)
    {
        this.setDevice();
        if( this.state.device === 'desktop' )
        {
            let newState                   = {...this.state},
                hoveredElement             = event.currentTarget,
                selectedDropDownTargetName = hoveredElement.dataset.content,
                contentElement             = document.querySelector('li[data-content="'+ hoveredElement.dataset.content +'"] > div.content'),
                selectedDropDownHeight     = contentElement.clientHeight,
                selectedDropDownWidth      = contentElement.clientWidth,
                selectedDropDownLeft       = hoveredElement.offsetLeft + hoveredElement.clientWidth/2 - selectedDropDownWidth/2;

            // Update dropdown position and size
            this.updateDropDownPosition(parseInt(selectedDropDownHeight), selectedDropDownWidth, parseInt(selectedDropDownLeft));

            let slicePosition      = this.state.dropDownList.menusOrder.indexOf(selectedDropDownTargetName),
                previousElements   = this.state.dropDownList.menusOrder.slice(0, slicePosition),
                subsequentElements = this.state.dropDownList.menusOrder.slice(slicePosition+1);

            // Set classes for the active element and the others: preceeding it and subsequent to it
            newState.dropDownList.menusClass[selectedDropDownTargetName] = ' active';
            previousElements.forEach(   (el) => { newState.dropDownList.menusClass[el] = ' move-left'; });
            subsequentElements.forEach( (el) => { newState.dropDownList.menusClass[el] = ' move-right'; });

            setTimeout(() => { // Show the dropdown wrapper if not visible yet
                newState.dropDownList.activeClass = ' is-dropdown-visible';
                this.setState(newState);
            }, 10);
        }
    }

    hideDropdown(event)
    {
        console.log('Hi');
        setTimeout( () => { //if not hovering over a nav item or a dropdown -> hide dropdown
            this.setDevice();
            if( this.state.device === 'desktop' )
            {
                let newState = {...this.state};
                newState.dropDownList.menusOrder.forEach( (el) => {
                    newState.dropDownList.menusClass[el] = '';
                });
                newState.dropDownList.activeClass = '';
            }
        }, 50);
    }

    toggleOpenHamburguerMenu()
    {
        this.setState({...this.state,
            hamburguerMenuClass: (this.state.hamburguerMenuClass === '' ? ' nav-open' : '')
        });
    }

    render() {
        const navEvents = {
            onMouseEnter: this.showDropDown.bind(this),
            onMouseLeave: this.hideDropdown.bind(this)
        };

        return (
            <div className={'stripe-dropdown' + this.state.hamburguerMenuClass + this.state.dropDownList.activeClass}>
                <a href="#0" className='nav-trigger' onClick={this.toggleOpenHamburguerMenu.bind(this)}>Open Nav<span aria-hidden="true"/></a>

                <nav className="main-nav">
                    <ul>
                        <li className="has-dropdown about" data-content="about" {...navEvents}>
                            <a href="#0">About us</a>
                        </li>

                        <li className="has-dropdown links" data-content="pricing" {...navEvents}>
                            <a href="#0">Login</a>
                        </li>

                        <li className="has-dropdown button" data-content="contact" {...navEvents}>
                            <a href="#0">Signup</a>
                        </li>
                    </ul>
                </nav>

                <div className="stripe-dropdown-wrapper">
                    <div className='dropdown-list' style={this.state.dropDownList.style}>
                        <ul>
                            <li data-content="about" className={'dropdown gallery' + this.state.dropDownList.menusClass['about']}>
                                <a href="#0" className="label"><SignUp/></a>
                                <div className="content" onMouseEnter={this.showDropDown.bind(this)}>
                                    <ul>
                                        <li>
                                            <a href="#0">
                                                <em>Title here</em>
                                                <span>A brief description here</span>
                                            </a>
                                        </li>

                                        <li>
                                            <a href="#0">
                                                <em>Title here</em>
                                                <span>A brief description here</span>
                                            </a>
                                        </li>

                                        <li>
                                            <a href="#0">
                                                <em>Title here</em>
                                                <span>A brief description here</span>
                                            </a>
                                        </li>

                                        <li>
                                            <a href="#0">
                                                <em>Title here</em>
                                                <span>A brief description here</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </li>

                            <li data-content="pricing" className={'dropdown links' + this.state.dropDownList.menusClass['pricing']}>
                                <a href="#0" className="label">Pricing</a>
                                <div className="content">
                                    <ul>
                                        <li>
                                            <h2>Services</h2>
                                            <ul className="links-list">
                                                <li><a href="#0">Logo Design</a></li>
                                                <li><a href="#0">Branding</a></li>
                                                <li><a href="#0">Web Design</a></li>
                                                <li><a href="#0">iOS</a></li>
                                                <li><a href="#0">Android</a></li>
                                                <li><a href="#0">HTML/CSS/JS</a></li>
                                                <li><a href="#0">Packaging</a></li>
                                                <li><a href="#0">Mobile</a></li>
                                                <li><a href="#0">UI/UX</a></li>
                                                <li><a href="#0">Prototyping</a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </li>

                            <li data-content="contact" className={'dropdown button' + this.state.dropDownList.menusClass['contact']}>
                                <a href="#0" className="label">Contact</a>
                                <div className="content">
                                    <ul className="links-list">
                                        <li><a href="#0">Link #1</a></li>
                                        <li><a href="#0">Link #2</a></li>
                                        <li><a href="#0">Link #3</a></li>
                                        <li><a href="#0">Link #4</a></li>
                                        <li><a href="#0">Link #5</a></li>
                                        <li><a href="#0">Link #6</a></li>
                                    </ul>
                                    <a href="#0" className="btn">Get in Touch</a>
                                </div>
                            </li>
                        </ul>

                        <div className='bg-layer' aria-hidden="true" style={this.state.bgLayerStyle}/>
                    </div>
                </div>
            </div>
        );
    }
}

class StripeLikeMenuNavigation extends React.Component {

}