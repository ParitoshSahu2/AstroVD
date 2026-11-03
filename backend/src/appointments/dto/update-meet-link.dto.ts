import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class UpdateMeetLinkDto {
  @ApiProperty({
    description: 'Consultation room meeting URL (Google Meet, Zoom, or Microsoft Teams)',
    example: 'https://meet.google.com/meet/hui-smdn-gtp',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^https:\/\/(meet\.google\.com\/[a-zA-Z0-9?=_&/-]+|([a-z0-9-]+\.)?zoom\.us\/(j\/|my\/)?[a-zA-Z0-9?=_&-]+|teams\.(microsoft|live)\.com\/[a-zA-Z0-9?=_&/-]+)/,
    {
      message:
        'Meeting link must be a valid secure URL starting with https:// on an approved video provider (Google Meet, Zoom, or Microsoft Teams)',
    },
  )
  meetLink!: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;
}
