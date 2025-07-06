import React from 'react'

export type AvatarType = 'cat' | 'dog'

interface Props {
  type: AvatarType
  animate?: boolean
}

export const Avatar: React.FC<Props> = ({ type, animate = true }) => {
  if (type === 'dog') return <Dog animate={animate} />
  return <Cat animate={animate} />
}

const Cat: React.FC<{ animate?: boolean }> = ({ animate }) => (
  <div className={`avatar-cat${animate ? '' : ' no-animation'}`}>
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
  </div>
)

const Dog: React.FC<{ animate?: boolean }> = ({ animate }) => (
  <div className={`avatar-dog${animate ? '' : ' no-animation'}`}>
    <div className='head'>
      <div className='ear ear-left'>
        <div className='inner-ear inner-ear-left'></div>
      </div>
      <div className='ear ear-right'>
        <div className='inner-ear inner-ear-right'></div>
      </div>
      <div className='face face-left'>
        <div className='dot dot-1'></div>
        <div className='dot dot-2'></div>
        <div className='dot dot-3'></div>
      </div>
      <div className='face face-mid'></div>
      <div className='face face-right'>
        <div className='dot dot-1'></div>
        <div className='dot dot-2'></div>
        <div className='dot dot-3'></div>
      </div>
      <div className='eye eye-left'></div>
      <div className='eye eye-right'></div>
      <div className='nose'>
        <div className='dot'></div>
      </div>
      <div className='mounth'></div>
      <div className='tongue'></div>
    </div>
  </div>
)

export default Avatar
