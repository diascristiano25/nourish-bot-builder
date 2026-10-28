import { render, screen } from '@testing-library/react';
import { VideoCallModal } from '../VideoCallModal';

describe('VideoCallModal', () => {
  it('renders Jitsi iframe when open', () => {
    render(<VideoCallModal appointmentId="test-123" isOpen={true} onClose={() => {}} />);
    expect(screen.getByTitle('Video consultation')).toBeInTheDocument();
  });

  it('does not render iframe when closed', () => {
    render(<VideoCallModal appointmentId="test-123" isOpen={false} onClose={() => {}} />);
    expect(screen.queryByTitle('Video consultation')).not.toBeInTheDocument();
  });

  it('maintains stable roomId across re-renders with same appointmentId', () => {
    const { rerender } = render(<VideoCallModal appointmentId="stable-test" isOpen={true} onClose={() => {}} />);
    const firstIframe = screen.getByTitle('Video consultation') as HTMLIFrameElement;
    const firstSrc = firstIframe.src;

    rerender(<VideoCallModal appointmentId="stable-test" isOpen={true} onClose={() => {}} />);
    const secondIframe = screen.getByTitle('Video consultation') as HTMLIFrameElement;
    const secondSrc = secondIframe.src;

    expect(firstSrc).toBe(secondSrc);
  });
});