import React from 'react'
import '../styles/avatar.css'

export const Avatar = ({ type, animate = true }: { type: 'cat' | 'dog'; animate?: boolean }) => {
  if (type === 'cat') {
    return (
      <div className={`avatar cat ${animate ? 'animate' : ''}`}>
        <div className='cat'>
          <div className='head'>
            <div className='ears'>
              <div className='ear left'></div>
              <div className='ear right'></div>
            </div>
            <div className='eyes'>
              <div className='eye left'></div>
              <div className='eye right'></div>
            </div>
            <div className='muzzle'>
              <div className='nose'></div>
            </div>
          </div>
          <div className='body'>
            <div className='paw'></div>
          </div>
          <div className='tail'>
            <div className='tail-segment'>
              <div className='tail-segment'>
                <div className='tail-segment'>
                  <div className='tail-segment'>
                    <div className='tail-segment'>
                      <div className='tail-segment'>
                        <div className='tail-segment'>
                          <div className='tail-segment'>
                            <div className='tail-segment'>
                              <div className='tail-segment'>
                                <div className='tail-segment'>
                                  <div className='tail-segment'>
                                    <div className='tail-segment'></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return <div className={`avatar dog ${animate ? 'animate' : ''}`}></div>
}
export default Avatar
