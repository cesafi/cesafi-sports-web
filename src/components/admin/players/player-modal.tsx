// @ts-nocheck
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModalLayout } from '@/components/ui/modal-layout';
import { ImageUpload } from '@/components/shared/image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayerInsert, PlayerUpdate, PlayerWithTeam } from '@/lib/types/players';
import { createPlayerSchema, updatePlayerSchema } from '@/lib/validations/players';
import { useAllSchoolsTeams } from '@/hooks/use-schools-teams';
import { toast } from 'sonner';
import { ZodError } from 'zod';
import { Textarea } from '@/components/ui/textarea';

interface PlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  player?: PlayerWithTeam;
  onSubmit: (data: PlayerInsert | PlayerUpdate, teamId?: string | null) => void;
  isSubmitting: boolean;
}

export function PlayerModal({
  open,
  onOpenChange,
  mode,
  player,
  onSubmit,
  isSubmitting
}: PlayerModalProps) {
  const [formData, setFormData] = useState<PlayerInsert | PlayerUpdate>({
    first_name: '',
    last_name: '',
    photo_url: null,
    is_active: true,
    player_number: null,
    position: null,
    school_team_id: '',
    sport_id: 1, // Defaulting to 1 for now, will handle dropdown later if needed
    slug: '',
    bio: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasStartedCreating = useRef(false);
  const hasStartedUpdating = useRef(false);

  const { data: teams = [] } = useAllSchoolsTeams();

  const handleClose = useCallback(() => {
    setErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && player) {
        setFormData({
          id: player.id,
          first_name: player.first_name || '',
          last_name: player.last_name || '',
          photo_url: player.photo_url || null,
          is_active: player.is_active ?? true,
          player_number: player.player_number || null,
          position: player.position || null,
          school_team_id: player.school_team_id || '',
          sport_id: player.sport_id || 1,
          slug: player.slug || '',
          bio: player.bio || null
        } as PlayerUpdate);
      } else {
        setFormData({
          first_name: '',
          last_name: '',
          photo_url: null,
          is_active: true,
          player_number: null,
          position: null,
          school_team_id: '',
          sport_id: 1,
          slug: '',
          bio: null
        } as PlayerInsert);
      }
      setErrors({});
      hasStartedCreating.current = false;
      hasStartedUpdating.current = false;
    }
  }, [open, mode, player]);

  // Handle mutation completion
  useEffect(() => {
    if (hasStartedCreating.current && !isSubmitting && mode === 'add') {
      handleClose();
    }
  }, [isSubmitting, mode, handleClose]);

  useEffect(() => {
    if (hasStartedUpdating.current && !isSubmitting && mode === 'edit') {
      handleClose();
    }
  }, [isSubmitting, mode, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const schema = mode === 'add' ? createPlayerSchema : updatePlayerSchema;
      const validatedData = schema.parse(formData);

      if (mode === 'add') {
        hasStartedCreating.current = true;
      } else {
        hasStartedUpdating.current = true;
      }

      onSubmit(validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleInputChange = (field: string, value: string | boolean | null | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-generate slug from first and last name if in add mode and slug hasn't been manually edited
      if (mode === 'add' && (field === 'first_name' || field === 'last_name')) {
        const fn = field === 'first_name' ? value : prev.first_name;
        const ln = field === 'last_name' ? value : prev.last_name;
        if (fn || ln) {
          newData.slug = `${fn || ''}-${ln || ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
      }
      
      return newData;
    });

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <ModalLayout
      open={open}
      onOpenChange={handleClose}
      title={mode === 'add' ? 'Add New Player' : 'Edit Player'}
      maxWidth="max-w-xl"
      footer={
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="player-form"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Player' : 'Update Player'}
          </Button>
        </div>
      }
    >
      <form id="player-form" onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Player Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Photo</Label>
              <ImageUpload
                preset="PLAYER_PHOTO"
                currentImageUrl={formData.photo_url || undefined}
                onUpload={(url) => handleInputChange('photo_url', url)}
                onRemove={() => handleInputChange('photo_url', null)}
                placeholder="Upload primary photo"
                description="Upload the primary photo of the player. Recommended: 300x300px."
                showPreview={true}
                showRemoveButton={true}
                error={errors.photo_url}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* First Name Field */}
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  className={errors.first_name ? 'border-red-500' : ''}
                />
                {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
              </div>

              {/* Last Name Field */}
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  className={errors.last_name ? 'border-red-500' : ''}
                />
                {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Player Number Field */}
              <div className="space-y-2">
                <Label htmlFor="player_number">Jersey Number</Label>
                <Input
                  id="player_number"
                  type="number"
                  value={formData.player_number || ''}
                  onChange={(e) => handleInputChange('player_number', parseInt(e.target.value) || null)}
                  placeholder="e.g. 23"
                  className={errors.player_number ? 'border-red-500' : ''}
                />
                {errors.player_number && <p className="text-sm text-red-500">{errors.player_number}</p>}
              </div>

              {/* Position Field */}
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position || ''}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="e.g. Point Guard"
                  className={errors.position ? 'border-red-500' : ''}
                />
                {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
              </div>
            </div>

            {/* School Team Select */}
            <div className="space-y-2">
              <Label htmlFor="school_team_id">School Team *</Label>
              <Select
                value={formData.school_team_id || ''}
                onValueChange={(value) => handleInputChange('school_team_id', value)}
              >
                <SelectTrigger className={errors.school_team_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.school?.name} - {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.school_team_id && <p className="text-sm text-red-500">{errors.school_team_id}</p>}
            </div>

            {/* Slug Field */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                placeholder="Enter unique slug"
                className={errors.slug ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">Used in the URL: /players/your-slug</p>
              {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Enter player biography"
                className={`min-h-[100px] ${errors.bio ? 'border-red-500' : ''}`}
              />
              {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is_active"
                checked={formData.is_active ?? true}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active Player</Label>
            </div>
          </CardContent>
        </Card>
      </form>
    </ModalLayout>
  );
}
