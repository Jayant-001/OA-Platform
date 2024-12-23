import { TagRepository } from "../repositories/tagRepository";
import { Tag } from "../models/tag";
import { HttpException } from "../middleware/errorHandler";

export class TagService {
    private tagRepository = new TagRepository();

    async createTag(tagData: Omit<Tag, "id" | "created_at" | "updated_at">): Promise<Tag> {
        const tagCode = tagData.name.trim().replace(/\s+/g, '_').toUpperCase();
        return this.tagRepository.create(tagData.name, tagCode);
    }

    async getTags(): Promise<Tag[]> {
        return this.tagRepository.findAll();
    }

    async getTagById(id: string): Promise<Tag | null> {
        const tag = await this.tagRepository.findById(id);
        if (!tag) {
            throw new HttpException(404, "TAG_NOT_FOUND", "Tag not found");
        }
        return tag;
    }

    async updateTag(id: string, tagData: Partial<Omit<Tag, "id" | "created_at" | "updated_at">>): Promise<void> {
        const tag = await this.tagRepository.findById(id);
        if (!tag) {
            throw new HttpException(404, "TAG_NOT_FOUND", "Tag not found");
        }
        if (tagData.name) {
            tagData.code = tagData.name.replace(/\s+/g, '_').toUpperCase();
        }
        await this.tagRepository.update(id, tagData);
    }

    async deleteTag(id: string): Promise<void> {
        const tag = await this.tagRepository.findById(id);
        if (!tag) {
            throw new HttpException(404, "TAG_NOT_FOUND", "Tag not found");
        }
        await this.tagRepository.delete(id);
    }
}

