import { render, screen, fireEvent } from '@testing-library/react';
import { LogoUploader } from '../LogoUploader';

describe('LogoUploader', () => {
  it('rejects files larger than 2MB', async () => {
    const onUploadComplete = vi.fn();
    render(<LogoUploader onUploadComplete={onUploadComplete} />);

    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 }); // 3MB

    const input = screen.getByLabelText(/logo/i);
    await fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/arquivo muito grande/i)).toBeInTheDocument();
    expect(onUploadComplete).not.toHaveBeenCalled();
  });
});