import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignType, MatchingRule } from '@prisma/client';

export class CampaignKeywordDto {
  @IsString()
  @IsNotEmpty()
  keyword!: string;

  @IsEnum(MatchingRule)
  matchingRule!: MatchingRule;
}

export class CampaignPostDto {
  @IsString()
  @IsNotEmpty()
  mediaId!: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsString()
  @IsOptional()
  permalink?: string;
}

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty({ message: 'Campaign name is required' })
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CampaignType, { message: 'Invalid campaign type' })
  type!: CampaignType;

  @IsUUID('4', { message: 'Invalid Instagram Account ID' })
  @IsNotEmpty({ message: 'Instagram Account ID is required' })
  instagramAccountId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Reply message text is required' })
  replyMessage!: string;

  @IsString()
  @IsOptional()
  replyMediaUrl?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CampaignKeywordDto)
  keywords?: CampaignKeywordDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CampaignPostDto)
  posts?: CampaignPostDto[];
}

export class UpdateCampaignDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  replyMessage?: string;

  @IsString()
  @IsOptional()
  replyMediaUrl?: string;
}
