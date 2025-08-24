# UI Components

This directory contains reusable UI components used throughout the application.

## ConfirmationModal

A reusable confirmation modal component for destructive actions and confirmations.

### Features

- **Multiple Types**: Supports `delete`, `warning`, and `info` confirmation types
- **Customizable**: Configurable title, message, and button text
- **Loading States**: Built-in loading state with spinner
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Responsive**: Adapts to different screen sizes

### Props

```typescript
interface ConfirmationModalProps {
  isOpen: boolean;                    // Controls modal visibility
  onClose: () => void;               // Called when modal is closed
  onConfirm: () => void;             // Called when user confirms action
  title: string;                      // Modal title
  message: string;                    // Confirmation message
  type?: ConfirmationType;           // Type: 'delete' | 'warning' | 'info'
  confirmText?: string;              // Custom confirm button text
  cancelText?: string;               // Custom cancel button text
  isLoading?: boolean;               // Shows loading state
  destructive?: boolean;              // Whether action is destructive
}
```

### Usage Examples

#### Basic Delete Confirmation

```tsx
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

function DeleteAccountButton({ account, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Delete Account
      </Button>
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          onDelete(account.id);
          setIsModalOpen(false);
        }}
        title="Delete Account"
        message={`Are you sure you want to delete "${account.email}"? This action cannot be undone.`}
        type="delete"
      />
    </>
  );
}
```

#### Warning Confirmation

```tsx
<ConfirmationModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onConfirm={handleDangerousAction}
  title="Proceed with Caution"
  message="This action will affect multiple users and may cause data loss. Are you sure you want to continue?"
  type="warning"
  confirmText="Proceed"
  destructive={false}
/>
```

#### Info Confirmation

```tsx
<ConfirmationModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onConfirm={handleAction}
  title="Confirm Action"
  message="Please confirm that you want to proceed with this action."
  type="info"
  confirmText="Yes, Continue"
  destructive={false}
/>
```

#### With Loading State

```tsx
<ConfirmationModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onConfirm={handleDelete}
  title="Delete Account"
  message="Are you sure you want to delete this account?"
  type="delete"
  isLoading={isDeleting}
  confirmText="Delete Account"
/>
```

### Confirmation Types

#### Delete (Default)
- **Icon**: Trash can (red)
- **Button Style**: Destructive (red)
- **Default Text**: "Delete" / "Cancel"
- **Use Case**: Permanent deletions, destructive actions

#### Warning
- **Icon**: Alert triangle (amber)
- **Button Style**: Default
- **Default Text**: "Continue" / "Cancel"
- **Use Case**: Dangerous but reversible actions

#### Info
- **Icon**: Information circle (blue)
- **Button Style**: Default
- **Default Text**: "Confirm" / "Cancel"
- **Use Case**: General confirmations

### Styling

The component automatically adapts to your theme and includes:
- Proper spacing and typography
- Responsive design
- Dark/light mode support
- Consistent with other UI components

### Accessibility

- Proper ARIA labels
- Keyboard navigation (Escape to close)
- Focus management
- Screen reader friendly
- High contrast support

### Best Practices

1. **Always provide clear, descriptive messages**
2. **Use appropriate confirmation types**
3. **Include loading states for async operations**
4. **Set destructive={true} for dangerous actions**
5. **Provide meaningful button text**
6. **Handle both success and error cases**
